import { unstable_cache } from 'next/cache';
import type { Where } from 'payload';
import { cache } from 'react';
import type { Locale } from '@/i18n/localized-collections';
import { initPayload } from '@/lib/config';

/** Resolves a localized tag and lists only public posts, including during preview sessions. */
export const getCachedPostArchive = cache(
    unstable_cache(
        async (locale: Locale, tagSlug: string | undefined, pageNumber: number) => {
            const payload = await initPayload();
            const tags = tagSlug
                ? await payload.find({
                      collection: 'tags',
                      locale,
                      fallbackLocale: false,
                      overrideAccess: false,
                      depth: 0,
                      limit: 2,
                      select: { tag: true, name: true, slug: true },
                      where: { slug: { equals: tagSlug } },
                  })
                : null;

            // Fail closed for old duplicate slugs instead of choosing an arbitrary tag.
            if (tags && tags.docs.length !== 1) return null;
            const tag = tags?.docs[0] ?? null;
            const where: Where = { publishStatus: { equals: 'public' } };
            if (tag) where.tags = { contains: tag.id };

            const entries = await payload.find({
                collection: 'posts',
                locale,
                fallbackLocale: false,
                overrideAccess: false,
                draft: false,
                depth: 0,
                limit: 12,
                page: pageNumber,
                sort: ['-publishedAt', 'id'],
                select: { title: true, slug: true },
                where,
            });

            return { tag, entries };
        },
        ['post-archive'],
        { tags: ['posts', 'tags'] },
    ),
);
