import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';
import { archivePageNumberSchema } from '@/lib/schemas/pages';
import { assertLocale } from '@/lib/utilities/assert-locale';
import { formatPaginationLink } from '@/lib/utilities/get-page-number';
import { payloadRedirects } from '@/lib/utilities/payload-redirects';
import { getCachedPostArchive } from './payload/get-cached-post-archive';

/** Shares route validation and archive resolution between page content and metadata. */
export const getPostArchivePage = cache(async (locale: string, tag?: string, pageNumber?: string) => {
    assertLocale(locale);
    const parsedPage = archivePageNumberSchema.safeParse(pageNumber);
    if (!parsedPage.success) notFound();

    const currentPage = parsedPage.data;
    const routeDetails = { route: 'posts', type: 'path', slug: tag } as const;
    const canonical = formatPaginationLink(currentPage, locale, routeDetails);
    await payloadRedirects(canonical);

    const archive = await getCachedPostArchive(locale, tag, currentPage);
    if (!archive || (currentPage > 1 && currentPage > archive.entries.totalPages)) notFound();
    if (pageNumber !== undefined && currentPage === 1) permanentRedirect(canonical);

    return { ...archive, locale, currentPage, routeDetails };
});
