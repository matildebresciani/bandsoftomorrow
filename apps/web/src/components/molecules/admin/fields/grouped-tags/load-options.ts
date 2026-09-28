import type { z } from 'zod';
import { type TagGroupOption, type TagOption, tagGroupsPageSchema, tagsPageSchema } from '@/lib/schemas/tag-picker';

type LoadResult<T> = { data: T; isSuccess: true } | { isSuccess: false };
type RequestOptions = { api: string; locale: string; signal: AbortSignal };

const pageParams = (locale: string, page: number) =>
    new URLSearchParams({
        locale,
        'fallback-locale': 'none',
        page: String(page),
        limit: '50',
        depth: '0',
        sort: 'name,id',
    });

const requestPage = <T>(
    { api, signal }: RequestOptions,
    collection: 'tags' | 'tag-groups',
    params: URLSearchParams,
    schema: z.ZodType<T>,
): Promise<LoadResult<T>> =>
    fetch(`${api}/${collection}`, {
        // Payload's method override avoids URL-length limits for large sets of selected IDs.
        method: 'POST',
        // Payload checks this exact content type; URLSearchParams' default charset suffix is not accepted.
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Payload-HTTP-Method-Override': 'GET' },
        body: params,
        credentials: 'include',
        signal,
    })
        .then(async (response): Promise<LoadResult<T>> => {
            if (!response.ok) return { isSuccess: false };
            const json: unknown = await response.json();
            const parsed = schema.safeParse(json);
            return parsed.success ? { isSuccess: true, data: parsed.data } : { isSuccess: false };
        })
        .catch((): LoadResult<T> => ({ isSuccess: false }));

/** Load every eligible group rather than silently truncating the available taxonomy. */
export const loadPostTagGroups = async (request: RequestOptions): Promise<LoadResult<TagGroupOption[]>> => {
    const groups: TagGroupOption[] = [];
    let page = 1;
    while (!request.signal.aborted) {
        const params = pageParams(request.locale, page);
        params.set('where[collectionsOnTagGroup][contains]', 'posts');
        for (const field of ['name', 'tagGroup', 'collectionsOnTagGroup']) params.set(`select[${field}]`, 'true');
        const result = await requestPage(request, 'tag-groups', params, tagGroupsPageSchema);
        if (!result.isSuccess) return result;
        groups.push(...result.data.docs.filter((group) => group.collectionsOnTagGroup?.includes('posts')));
        if (!result.data.nextPage) return { isSuccess: true, data: groups };
        if (result.data.nextPage <= page) return { isSuccess: false };
        page = result.data.nextPage;
    }
    return { isSuccess: false };
};

/** Fetch one searchable page; grouping and label fallback are applied after loading. */
export const loadTagPage = async (
    request: RequestOptions,
    groupIds: string[],
    search: string,
    page = 1,
): Promise<LoadResult<z.infer<typeof tagsPageSchema>>> => {
    if (groupIds.length === 0) return { isSuccess: true, data: { docs: [], nextPage: null } };
    const params = pageParams(request.locale, page);
    for (const field of ['name', 'tag', 'tagGroup']) params.set(`select[${field}]`, 'true');
    groupIds.forEach((id, index) => params.set(`where[and][0][tagGroup][in][${index}]`, id));
    if (search.trim()) {
        params.set('where[and][1][or][0][tag][like]', search.trim());
        params.set('where[and][1][or][1][name][like]', search.trim());
    }
    return requestPage(request, 'tags', params, tagsPageSchema);
};

/** Hydrate saved selections without applying the dropdown's group eligibility filter. */
export const loadSelectedTags = async (request: RequestOptions, ids: string[]): Promise<LoadResult<TagOption[]>> => {
    if (ids.length === 0) return { isSuccess: true, data: [] };
    const tags: TagOption[] = [];
    let page = 1;
    while (!request.signal.aborted) {
        const params = pageParams(request.locale, page);
        for (const field of ['name', 'tag', 'tagGroup']) params.set(`select[${field}]`, 'true');
        ids.forEach((id, index) => params.set(`where[id][in][${index}]`, id));
        const result = await requestPage(request, 'tags', params, tagsPageSchema);
        if (!result.isSuccess) return result;
        tags.push(...result.data.docs);
        if (!result.data.nextPage) return { isSuccess: true, data: tags };
        if (result.data.nextPage <= page) return { isSuccess: false };
        page = result.data.nextPage;
    }
    return { isSuccess: false };
};
