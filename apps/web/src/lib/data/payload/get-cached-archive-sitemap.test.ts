import { describe, expect, it, vi } from 'vitest';
import { getCachedArchiveSitemaps } from './get-cached-archive-sitemap';

const { find } = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock('@/lib/config', () => ({ initPayload: async () => ({ find }) }));
vi.mock('@/lib/utilities/get-url', () => ({ getServerSideURL: () => 'https://example.com/' }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

describe('tag archive sitemaps', () => {
    it.each(['da', 'en'] as const)('includes the root and unambiguous translated tags in %s', async (locale) => {
        find.mockResolvedValue({
            docs: [{ slug: 'rock' }, { slug: null }, { slug: 'duplicate' }, { slug: 'duplicate' }],
        });
        const root = locale === 'da' ? '/artikler' : '/en/posts';
        expect(await getCachedArchiveSitemaps(locale)).toEqual([
            { loc: `https://example.com${root}` },
            { loc: `https://example.com${root}/rock` },
        ]);
        expect(find).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                collection: 'tags',
                locale,
                fallbackLocale: false,
                overrideAccess: false,
                pagination: false,
            }),
        );
    });
});
