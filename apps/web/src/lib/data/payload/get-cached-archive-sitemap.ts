import { unstable_cache } from 'next/cache';
import type { Locale } from '@/i18n/localized-collections';
import { initPayload } from '@/lib/config';
import { trimTrailingSlash } from '@/lib/utilities/composables';
import { formatArchiveLink } from '@/lib/utilities/format-link';
import { getServerSideURL } from '@/lib/utilities/get-url';

/** Includes only tag URLs that resolve unambiguously in the requested language. */
export const getCachedArchiveSitemaps = unstable_cache(
    async (locale: Locale) => {
        const payload = await initPayload();
        const tags = await payload.find({
            collection: 'tags',
            locale,
            fallbackLocale: false,
            overrideAccess: false,
            depth: 0,
            pagination: false,
            limit: 0,
            select: { slug: true },
        });
        const slugCounts = new Map<string, number>();
        for (const tag of tags.docs) {
            if (tag.slug) slugCounts.set(tag.slug, (slugCounts.get(tag.slug) ?? 0) + 1);
        }
        const slugs = [...slugCounts].filter(([, count]) => count === 1).map(([slug]) => slug);
        const siteUrl = trimTrailingSlash(getServerSideURL());

        return [undefined, ...slugs].map((slug) => ({
            loc: `${siteUrl}${formatArchiveLink({ route: 'posts', type: 'path', locale, slug })}`,
        }));
    },
    ['post-archive-sitemap'],
    { tags: ['tags'] },
);
