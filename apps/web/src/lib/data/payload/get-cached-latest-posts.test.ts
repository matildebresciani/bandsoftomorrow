import { describe, expect, it, vi } from 'vitest';
import { getCachedLatestPosts } from './get-cached-latest-posts';

const { find } = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock('@/lib/config', () => ({ initPayload: async () => ({ find }) }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

describe('latest posts query', () => {
    it('requests four public posts in publication order with populated card relationships', async () => {
        const docs = [{ id: 'newest' }, { id: 'older' }];
        find.mockResolvedValue({ docs });

        expect(await getCachedLatestPosts('da')).toEqual(docs);
        expect(find).toHaveBeenCalledExactlyOnceWith({
            collection: 'posts',
            locale: 'da',
            fallbackLocale: false,
            overrideAccess: false,
            draft: false,
            depth: 2,
            limit: 4,
            pagination: false,
            sort: ['-publishedAt', 'id'],
            select: {
                title: true,
                slug: true,
                publishedAt: true,
                tags: true,
                contentMeta: { featuredImage: true },
            },
            where: { publishStatus: { equals: 'public' }, slug: { exists: true } },
        });
    });
});
