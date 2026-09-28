import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPostTagGroups, loadSelectedTags, loadTagPage } from './load-options';

const fetchMock = vi.fn<typeof fetch>();
const request = () => ({ api: '/api', locale: 'da', signal: new AbortController().signal });
const page = (docs: unknown[], nextPage: number | null = null) => Response.json({ docs, nextPage });
const group = { id: 'genre', name: 'Genre', collectionsOnTagGroup: ['posts'] };

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => vi.unstubAllGlobals());

describe('Payload tag loading', () => {
    it('loads all eligible group pages and does not use showInFiltration', async () => {
        fetchMock.mockResolvedValueOnce(page([group], 2)).mockResolvedValueOnce(
            page([
                { id: 'artist', name: 'Artist', collectionsOnTagGroup: ['posts'] },
                { id: 'excluded', name: 'Excluded', collectionsOnTagGroup: [] },
            ]),
        );
        const result = await loadPostTagGroups(request());
        expect(result).toMatchObject({ isSuccess: true, data: [group, { id: 'artist' }] });
        const params = fetchMock.mock.calls[1]?.[1]?.body;
        assert(params instanceof URLSearchParams);
        expect(params.get('page')).toBe('2');
        expect(params.get('where[collectionsOnTagGroup][contains]')).toBe('posts');
        expect(params.toString()).not.toContain('showInFiltration');
    });

    it('searches display and internal names inside eligible groups, with explicit locale and pagination', async () => {
        fetchMock.mockResolvedValue(page([]));
        const args = request();
        await loadTagPage(args, ['genre', 'artist'], ' pop ', 3);
        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(url).toBe('/api/tags');
        expect(init).toMatchObject({
            method: 'POST',
            credentials: 'include',
            signal: args.signal,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Payload-HTTP-Method-Override': 'GET' },
        });
        assert(init?.body instanceof URLSearchParams);
        expect(Object.fromEntries(init.body)).toMatchObject({
            locale: 'da',
            'fallback-locale': 'none',
            page: '3',
            limit: '50',
            depth: '0',
            'where[and][0][tagGroup][in][0]': 'genre',
            'where[and][0][tagGroup][in][1]': 'artist',
            'where[and][1][or][0][tag][like]': 'pop',
            'where[and][1][or][1][name][like]': 'pop',
        });
    });

    it('loads selected tags separately, without restricting groups, across pages', async () => {
        const legacy = { id: 'legacy', name: 'Legacy', tagGroup: 'unassigned' };
        const second = { id: 'second', name: 'Other', tagGroup: 'genre' };
        fetchMock.mockResolvedValueOnce(page([legacy], 2)).mockResolvedValueOnce(page([second]));
        expect(await loadSelectedTags(request(), ['legacy', 'second'])).toEqual({
            isSuccess: true,
            data: [legacy, second],
        });
        const params = fetchMock.mock.calls[0]?.[1]?.body;
        assert(params instanceof URLSearchParams);
        expect(params.get('where[id][in][0]')).toBe('legacy');
        expect([...params.keys()].filter((key) => key.startsWith('where'))).toEqual([
            'where[id][in][0]',
            'where[id][in][1]',
        ]);
    });

    it('skips empty selection and empty eligibility requests', async () => {
        expect(await loadTagPage(request(), [], '')).toEqual({ isSuccess: true, data: { docs: [], nextPage: null } });
        expect(await loadSelectedTags(request(), [])).toEqual({ isSuccess: true, data: [] });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(['http', 'json', 'schema', 'network'])('reports %s failures without throwing', async (kind) => {
        if (kind === 'http') fetchMock.mockResolvedValue(new Response('', { status: 403 }));
        if (kind === 'json') fetchMock.mockResolvedValue(new Response('not json'));
        if (kind === 'schema') fetchMock.mockResolvedValue(Response.json({ docs: [{ id: 7 }] }));
        if (kind === 'network') fetchMock.mockRejectedValue(new TypeError('offline'));
        expect(await loadTagPage(request(), ['genre'], '')).toEqual({ isSuccess: false });
    });

    it('stops aborted and non-advancing pagination', async () => {
        fetchMock.mockResolvedValue(page([group], 1));
        expect(await loadPostTagGroups(request())).toEqual({ isSuccess: false });
        fetchMock.mockClear();
        expect(await loadPostTagGroups({ ...request(), signal: AbortSignal.abort() })).toEqual({ isSuccess: false });
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
