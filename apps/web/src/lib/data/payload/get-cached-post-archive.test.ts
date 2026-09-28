import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCachedPostArchive } from './get-cached-post-archive';

const { find } = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock('@/lib/config', () => ({ initPayload: async () => ({ find }) }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

const tag = { id: 'review-tag', tag: 'Anmeldelser', slug: 'anmeldelser' };
const entries = { docs: [{ id: 'post', title: 'Review', slug: 'review' }], totalPages: 2 };

beforeEach(() => {
    find.mockResolvedValueOnce({ docs: [tag] }).mockResolvedValueOnce(entries);
});

describe('public tag archive queries', () => {
    it('resolves the exact localized slug and filters posts by stable relationship ID', async () => {
        expect(await getCachedPostArchive('da', 'anmeldelser', 2)).toEqual({ tag, entries });
        expect(find).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                collection: 'tags',
                locale: 'da',
                fallbackLocale: false,
                overrideAccess: false,
                where: { slug: { equals: 'anmeldelser' } },
            }),
        );
        expect(find).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                collection: 'posts',
                locale: 'da',
                draft: false,
                overrideAccess: false,
                depth: 0,
                limit: 12,
                page: 2,
                sort: ['-publishedAt', 'id'],
                where: { publishStatus: { equals: 'public' }, tags: { contains: 'review-tag' } },
                select: { title: true, slug: true },
            }),
        );
    });

    it('lists all public posts at the root without a category or tag condition', async () => {
        find.mockReset().mockResolvedValue(entries);
        expect(await getCachedPostArchive('en', undefined, 1)).toEqual({ tag: null, entries });
        expect(find).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                collection: 'posts',
                locale: 'en',
                draft: false,
                overrideAccess: false,
                where: { publishStatus: { equals: 'public' } },
            }),
        );
    });

    it.each([
        { docs: [] },
        { docs: [tag, { ...tag, id: 'duplicate' }] },
    ])('rejects unknown or ambiguous tags without a category fallback', async ({ docs }) => {
        find.mockReset().mockResolvedValue({ docs });
        expect(await getCachedPostArchive('da', 'anmeldelser', 1)).toBeNull();
        expect(find).toHaveBeenCalledTimes(1);
    });

    it('keeps a valid tag archive available with no matching public posts', async () => {
        const empty = { docs: [], totalPages: 1 };
        find.mockReset()
            .mockResolvedValueOnce({ docs: [tag] })
            .mockResolvedValueOnce(empty);
        expect(await getCachedPostArchive('da', 'anmeldelser', 1)).toEqual({ tag, entries: empty });
    });
});
