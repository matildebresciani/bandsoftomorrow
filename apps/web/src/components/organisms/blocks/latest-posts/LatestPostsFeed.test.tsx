import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ArticleCardPost } from '@/components/molecules/frontend/article-cards/article-card-shared';
import LatestPostsFeed from './LatestPostsFeed';

beforeAll(() => {
    vi.stubGlobal('React', React);
});

const makePost = (index: number): ArticleCardPost => ({
    id: `post-${index}`,
    title: `Article ${index}`,
    slug: `article-${index}`,
    publishedAt: '2026-09-28T12:00:00.000Z',
});

describe('LatestPostsFeed', () => {
    it('renders at most one large and three small joined cards under a localized section heading', () => {
        const posts = [1, 2, 3, 4, 5].map(makePost);
        const html = renderToStaticMarkup(<LatestPostsFeed heading="Seneste artikler" posts={posts} locale="da" />);

        expect(html).toContain('<h2 class="heading-1');
        expect(html.match(/Seneste artikler/g)).toHaveLength(3);
        expect(html.match(/aria-hidden="true"/g)).toHaveLength(2);
        expect(html.match(/<h3 class="heading-4/g)).toHaveLength(4);
        expect(html.match(/href="\/artikel\/article-/g)).toHaveLength(4);
        expect(html).not.toContain('Article 5');
        expect(html).toContain('lg:grid-cols-[7fr_5fr]');
        expect(html).toContain('lg:border-r-0');
        expect(html).toContain('border-t-0 lg:first:border-t');
        expect(html.indexOf('Article 1')).toBeLessThan(html.indexOf('Article 2'));
    });

    it('renders the available posts and English links when there are fewer than four', () => {
        const html = renderToStaticMarkup(
            <LatestPostsFeed heading="Latest articles" posts={[makePost(1), makePost(2)]} locale="en" />,
        );

        expect(html).toContain('Latest articles</span></h2>');
        expect(html.match(/href="\/en\/post\/article-/g)).toHaveLength(2);
        expect(html.match(/<h3 class="heading-4/g)).toHaveLength(2);
    });

    it('keeps a single lead card full width', () => {
        const html = renderToStaticMarkup(
            <LatestPostsFeed heading="Latest articles" posts={[makePost(1)]} locale="en" />,
        );

        expect(html).not.toContain('lg:grid-cols-[7fr_5fr]');
        expect(html).not.toContain('lg:border-r-0');
        expect(html.match(/href="\/en\/post\/article-/g)).toHaveLength(1);
    });

    it('hides the block when no public posts are available', () => {
        expect(renderToStaticMarkup(<LatestPostsFeed heading="Latest articles" posts={[]} locale="en" />)).toBe('');
    });
});
