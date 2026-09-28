import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { describe, expect, it } from 'vitest';
import { formatArchiveLink, formatLinkByCollection } from '@/lib/utilities/format-link';
import { formatPaginationLink } from '@/lib/utilities/get-page-number';
import { getPathname, routing } from './routing';

const middleware = createMiddleware(routing);

describe('shared tag archive routing', () => {
    it.each([
        ['da', 'anmeldelser', '/artikler/anmeldelser', 'side'],
        ['da', 'interviews', '/artikler/interviews', 'side'],
        ['da', 'ugens-udgivelser', '/artikler/ugens-udgivelser', 'side'],
        ['en', 'reviews', '/en/posts/reviews', 'page'],
        ['en', 'interviews', '/en/posts/interviews', 'page'],
        ['en', 'weekly-releases', '/en/posts/weekly-releases', 'page'],
    ] as const)('localizes %s archive %s', (locale, tag, expected, pageSegment) => {
        const route = { route: 'posts', type: 'path', slug: tag } as const;
        expect(getPathname({ locale, href: { pathname: '/posts/[tag]', params: { tag } } })).toBe(expected);
        expect(formatArchiveLink({ ...route, locale })).toBe(expected);
        expect(formatPaginationLink(1, locale, route)).toBe(expected);
        expect(formatPaginationLink(2, locale, route)).toBe(`${expected}/${pageSegment}/2`);
        expect(
            getPathname({
                locale,
                href: { pathname: '/posts/[tag]/page/[pageNumber]', params: { tag, pageNumber: 2 } },
            }),
        ).toBe(`${expected}/${pageSegment}/2`);

        const response = middleware(new NextRequest(`http://localhost:3000${expected}/${pageSegment}/2`));
        if (locale === 'da') {
            expect(response.headers.get('x-middleware-rewrite')).toBe(`http://localhost:3000/da/posts/${tag}/page/2`);
        } else {
            expect(response.headers.get('x-middleware-next')).toBe('1');
        }
    });

    it('keeps Danish unprefixed and article URLs independent of tags', () => {
        expect(routing.defaultLocale).toBe('da');
        expect(formatArchiveLink({ route: 'posts', type: 'path', locale: 'da' })).toBe('/artikler');
        expect(formatArchiveLink({ route: 'posts', type: 'path', locale: 'en' })).toBe('/en/posts');
        expect(formatLinkByCollection('my-article', 'posts', 'da')).toBe('/artikel/my-article');
        expect(formatLinkByCollection('my-article', 'posts', 'en')).toBe('/en/post/my-article');
        expect(middleware(new NextRequest('http://localhost:3000/da/artikler/rock')).headers.get('location')).toBe(
            'http://localhost:3000/artikler/rock',
        );
    });
});
