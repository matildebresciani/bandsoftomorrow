import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Media } from '@/payload-types';
import EditorialHeroSlider from './EditorialHeroSlider';
import type { EditorialHeroSlide } from './types';

const state = vi.hoisted<{ shouldReduceMotion: boolean; autoplay: unknown; speed: number | null }>(() => ({
    shouldReduceMotion: false,
    autoplay: null,
    speed: null,
}));

vi.mock('motion/react', async (importOriginal) => ({
    ...(await importOriginal<typeof import('motion/react')>()),
    useReducedMotion: () => state.shouldReduceMotion,
}));

vi.mock('swiper/react', async () => {
    const { createElement } = await import('react');
    return {
        Swiper: ({ children, autoplay, speed }: { children: React.ReactNode; autoplay: unknown; speed: number }) => {
            state.autoplay = autoplay;
            state.speed = speed;
            return createElement('div', { className: 'swiper' }, children);
        },
        SwiperSlide: ({ children }: { children: React.ReactNode }) => createElement('div', {}, children),
    };
});

vi.mock('@/components/atoms/frontend/media/ImageMedia', async () => {
    const { createElement } = await import('react');
    return {
        ImageMedia: ({
            resource,
            priority,
            loading,
            fetchPriority,
        }: {
            resource: Media;
            priority?: boolean;
            loading?: string;
            fetchPriority?: string;
        }) =>
            createElement('img', {
                src: resource.url,
                alt: resource.alt,
                'data-priority': String(Boolean(priority)),
                'data-fetch-priority': fetchPriority ?? 'auto',
                loading,
            }),
    };
});

const slide = (index: number): EditorialHeroSlide => ({
    id: `post-${index}`,
    href: `/en/post/post-${index}`,
    title: `Post ${index}`,
    image: {
        id: `image-${index}`,
        alt: `Image ${index}`,
        url: `/image-${index}.jpg`,
        width: 1200,
        height: 800,
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
    },
    badge: null,
    date: null,
    excerpt: null,
});

beforeEach(() => {
    state.shouldReduceMotion = false;
    state.autoplay = null;
    state.speed = null;
});

describe('EditorialHeroSlider', () => {
    it('renders one linked slide without autoplay or dots', () => {
        const html = renderToStaticMarkup(
            React.createElement(EditorialHeroSlider, { slides: [slide(1)], locale: 'en' }),
        );

        expect(html).toContain('href="/en/post/post-1"');
        expect(html).toContain('data-priority="true"');
        expect(html).not.toContain('Go to slide');
        expect(state.autoplay).toBeNull();
    });

    it('prioritizes only the first of five images and renders five dots', () => {
        const slides = [slide(1), slide(2), slide(3), slide(4), slide(5)];
        const html = renderToStaticMarkup(React.createElement(EditorialHeroSlider, { slides, locale: 'en' }));

        expect(html.match(/data-priority="true"/g)).toHaveLength(1);
        expect(html.match(/data-fetch-priority="high"/g)).toHaveLength(1);
        expect(html.match(/loading="lazy"/g)).toHaveLength(4);
        expect(html.match(/aria-label="Go to slide/g)).toHaveLength(5);
        expect(state.autoplay).toMatchObject({ delay: 5000 });
        expect(state.speed).toBe(1000);
    });

    it('removes autoplay and slide movement for reduced-motion users', () => {
        state.shouldReduceMotion = true;
        renderToStaticMarkup(React.createElement(EditorialHeroSlider, { slides: [slide(1), slide(2)], locale: 'da' }));

        expect(state.autoplay).toBe(false);
        expect(state.speed).toBe(0);
    });
});
