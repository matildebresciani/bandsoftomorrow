import { describe, expect, it, vi } from 'vitest';
import { generateArchiveMetadata } from './metadata';

vi.mock('@/lib/config', () => ({ initPayload: vi.fn() }));
vi.mock('./payload/get-cached-options', () => ({
    getCachedOptions: async () => ({
        archives: {
            postsArchiveMeta: {
                title: 'Archive SEO title',
                description: 'Archive description',
                image: { url: '/archive.jpg' },
            },
        },
    }),
}));
vi.mock('@/lib/utilities/get-url', () => ({ getServerSideURL: () => 'https://example.com' }));
vi.mock('next-intl/server', () => ({
    getTranslations:
        async ({ locale }: { locale: string }) =>
        (key: string, values?: { pageNumber: number }) => {
            if (key === 'page') return `${locale === 'da' ? 'Side' : 'Page'} ${values?.pageNumber}`;
            return locale === 'da' ? 'Artikler' : 'Articles';
        },
}));

describe('archive metadata', () => {
    it.each([
        ['da', 'anmeldelser', 'Anmeldelser', '/artikler/anmeldelser/side/2', 'Side'],
        ['en', 'reviews', 'Reviews', '/en/posts/reviews/page/2', 'Page'],
    ])('uses the translated tag title and pagination canonical in %s', async (locale, slug, title, canonical, pageLabel) => {
        expect(
            await generateArchiveMetadata({ collection: 'posts', locale, slug, title, pageNumber: 2 }),
        ).toMatchObject({
            title: `${title} | ${pageLabel} 2`,
            alternates: { canonical },
            openGraph: { images: [{ url: 'https://example.com/archive.jpg' }] },
        });
    });

    it('retains root archive SEO settings and avoids double slashes in its Danish canonical', async () => {
        expect(
            await generateArchiveMetadata({ collection: 'posts', locale: 'da', slug: undefined, pageNumber: 1 }),
        ).toMatchObject({
            title: 'Archive SEO title',
            description: 'Archive description',
            alternates: { canonical: '/artikler' },
        });
    });
});
