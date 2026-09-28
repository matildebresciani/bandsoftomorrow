import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCachedPostArchive } from './payload/get-cached-post-archive';
import { getPostArchivePage } from './post-archive';

vi.mock('./payload/get-cached-post-archive', () => ({ getCachedPostArchive: vi.fn() }));
vi.mock('@/lib/utilities/payload-redirects', () => ({ payloadRedirects: vi.fn() }));

beforeEach(() => {
    vi.mocked(getCachedPostArchive).mockResolvedValue({
        tag: { id: 'tag', tag: 'Rock', name: 'Rock', slug: 'rock' },
        entries: {
            docs: [],
            totalPages: 2,
            totalDocs: 13,
            limit: 12,
            pagingCounter: 1,
            page: 1,
            hasPrevPage: false,
            hasNextPage: true,
        },
    });
});

describe('archive request validation', () => {
    it.each([
        '0',
        '-1',
        '1.5',
        'abc',
        '1e2',
        '01',
        '',
        '9007199254740992',
    ])('returns 404 for invalid page %s', async (page) => {
        await expect(getPostArchivePage('da', 'rock', page)).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        expect(getCachedPostArchive).not.toHaveBeenCalled();
    });

    it('returns 404 for unknown tags and out-of-range pages', async () => {
        await expect(getPostArchivePage('da', 'rock', '3')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        vi.mocked(getCachedPostArchive).mockResolvedValue(null);
        await expect(getPostArchivePage('da', 'missing')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    });

    it.each(['da', 'en'])('permanently redirects explicit page one in %s', async (locale) => {
        const expected = locale === 'da' ? '/artikler/rock' : '/en/posts/rock';
        await expect(getPostArchivePage(locale, 'rock', '1')).rejects.toMatchObject({
            digest: `NEXT_REDIRECT;replace;${expected};308;`,
        });
    });

    it('keeps root and tag pagination details for rendering and metadata', async () => {
        expect(await getPostArchivePage('da', 'rock', '2')).toMatchObject({
            locale: 'da',
            currentPage: 2,
            routeDetails: { route: 'posts', type: 'path', slug: 'rock' },
        });
        expect(await getPostArchivePage('en')).toMatchObject({ currentPage: 1 });
    });
});
