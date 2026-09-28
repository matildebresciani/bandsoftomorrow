import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Locale } from '@/i18n/localized-collections';
import { initPayload } from '@/lib/config';

/** Returns the four newest public posts with the relationships needed by article cards. */
export const getCachedLatestPosts = cache(
    unstable_cache(
        async (locale: Locale) => {
            const payload = await initPayload();
            const result = await payload.find({
                collection: 'posts',
                locale,
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

            return result.docs;
        },
        ['latest-posts'],
        { tags: ['posts', 'tags', 'tag-groups', 'media'] },
    ),
);
