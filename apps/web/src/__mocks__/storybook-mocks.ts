import type { TagBadgeTag } from '@/components/atoms/frontend/labels/tag-badge';
import type { Media } from '@/payload-types';

export const imageMock: Media = {
    id: '123',
    alt: 'Placeholder Image',
    url: '/images/__mocks__/placeholder.jpg',
    filename: 'placeholder.jpg',
    mimeType: 'image/jpeg',
    filesize: 12345,
    width: 800,
    height: 600,
    createdAt: '2025-10-17T00:00:00.000Z',
    updatedAt: '2025-10-17T00:00:00.000Z',
};

export const tagBadgeMocks = {
    review: {
        label: 'Anmeldelse',
        name: 'Review',
        slug: 'review',
        groupName: 'Article type',
        groupSlug: 'article-type',
    },
    concert: {
        label: 'Koncert',
        name: 'Concert',
        slug: 'concert',
        groupName: 'Review type',
        groupSlug: 'review-type',
    },
    interview: {
        label: 'Interview',
        name: 'Interview',
        slug: 'interview',
        groupName: 'Article type',
        groupSlug: 'article-type',
    },
    weeklyReleases: {
        label: 'Ugens udgivelser',
        name: 'Weekly releases',
        slug: 'weekly-releases',
        groupName: 'Article type',
        groupSlug: 'article-type',
    },
    album: {
        label: 'Album',
        name: 'Album',
        slug: 'album',
        groupName: 'Review type',
        groupSlug: 'review-type',
    },
    genre: {
        label: 'Rock',
        name: 'Rock',
        slug: 'rock',
        groupName: 'Genre',
        groupSlug: 'genre',
    },
} satisfies Record<string, TagBadgeTag>;

export const richTextMock = {
    root: {
        type: 'root',
        children: [
            {
                type: 'paragraph',
                version: 1,
                children: [
                    {
                        type: 'text',
                        version: 1,
                        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    },
                ],
                direction: null,
                format: '',
                indent: 0,
            },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
    },
};
