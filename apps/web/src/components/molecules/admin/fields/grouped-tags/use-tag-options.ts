'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TagGroupOption, TagOption } from '@/lib/schemas/tag-picker';
import { loadPostTagGroups, loadSelectedTags, loadTagPage } from './load-options';
import { mergeTags } from './options';

type QueryState = {
    key: string;
    groups: TagGroupOption[];
    tags: TagOption[];
    nextPage?: number | null;
    isLoading: boolean;
    hasError: boolean;
};

/** Synchronize dropdown candidates and saved IDs independently with Payload's REST API. */
export const useTagOptions = (api: string, locale: string, ids: string[], search: string) => {
    const [revision, setRevision] = useState(0);
    const refresh = useCallback(() => setRevision((value) => value + 1), []);
    const key = JSON.stringify([api, locale, search, revision]);
    const [query, setQuery] = useState<QueryState>({
        key: '',
        groups: [],
        tags: [],
        isLoading: true,
        hasError: false,
    });
    const [selected, setSelected] = useState<{
        locale: string;
        revision: number;
        tags: TagOption[];
        hasError: boolean;
        isLoading: boolean;
    }>({ locale, revision, tags: [], hasError: false, isLoading: true });
    const activeRequest = useRef<AbortController | null>(null);
    const isLoadingMore = useRef(false);
    // A serialized key avoids refetching simply because the form returns a new array instance.
    const idsKey = JSON.stringify(ids);
    const selectedIds: string[] = useMemo(() => JSON.parse(idsKey), [idsKey]);

    useEffect(() => {
        const controller = new AbortController();
        activeRequest.current = controller;
        isLoadingMore.current = false;
        setQuery({ key, groups: [], tags: [], isLoading: true, hasError: false });
        const timer = setTimeout(async () => {
            const request = { api, locale, signal: controller.signal };
            const groups = await loadPostTagGroups(request);
            if (controller.signal.aborted) return;
            if (!groups.isSuccess) {
                setQuery({ key, groups: [], tags: [], isLoading: false, hasError: true });
                return;
            }
            const tags = await loadTagPage(
                request,
                groups.data.map((group) => group.id),
                search,
            );
            if (controller.signal.aborted) return;
            setQuery({
                key,
                groups: groups.data,
                tags: tags.isSuccess ? tags.data.docs : [],
                nextPage: tags.isSuccess ? tags.data.nextPage : null,
                isLoading: false,
                hasError: !tags.isSuccess,
            });
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [api, locale, search, key]);

    useEffect(() => {
        const controller = new AbortController();
        setSelected((previous) => ({
            locale,
            revision,
            tags: previous.locale === locale ? previous.tags : [],
            hasError: false,
            isLoading: true,
        }));
        void loadSelectedTags({ api, locale, signal: controller.signal }, selectedIds).then((result) => {
            if (controller.signal.aborted) return;
            setSelected((previous) => ({
                locale,
                revision,
                tags: result.isSuccess ? result.data : previous.tags,
                hasError: !result.isSuccess,
                isLoading: false,
            }));
        });
        return () => controller.abort();
    }, [api, locale, selectedIds, revision]);

    const loadMore = useCallback(async () => {
        const controller = activeRequest.current;
        if (
            !controller ||
            controller.signal.aborted ||
            isLoadingMore.current ||
            query.key !== key ||
            query.isLoading ||
            !query.nextPage
        )
            return;
        isLoadingMore.current = true;
        setQuery((previous) => ({ ...previous, isLoading: true, hasError: false }));
        const result = await loadTagPage(
            { api, locale, signal: controller.signal },
            query.groups.map((group) => group.id),
            search,
            query.nextPage,
        );
        if (controller.signal.aborted) return;
        isLoadingMore.current = false;
        setQuery((previous) => ({
            ...previous,
            tags: result.isSuccess ? mergeTags(previous.tags, result.data.docs) : previous.tags,
            nextPage: result.isSuccess ? result.data.nextPage : previous.nextPage,
            isLoading: false,
            hasError: !result.isSuccess,
        }));
    }, [api, locale, search, query, key]);

    const isCurrent = query.key === key;
    const tags = useMemo(
        () => mergeTags(isCurrent ? query.tags : [], selected.locale === locale ? selected.tags : []),
        [isCurrent, query.tags, selected, locale],
    );
    return {
        groups: isCurrent ? query.groups : [],
        candidates: isCurrent ? query.tags : [],
        tags,
        isLoading: !isCurrent || query.isLoading,
        isLoadingSelection: selected.isLoading,
        hasError: (isCurrent && query.hasError) || selected.hasError,
        hasMore: isCurrent && Boolean(query.nextPage),
        loadMore,
        refresh,
    };
};
