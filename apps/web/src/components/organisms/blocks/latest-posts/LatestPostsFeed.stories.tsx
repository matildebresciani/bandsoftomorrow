import type { Meta, StoryObj } from '@storybook/nextjs';
import { imageMock } from '@/__mocks__/storybook-mocks';
import type { ArticleCardPost } from '@/components/molecules/frontend/article-cards/article-card-shared';
import type { Tag, TagGroup } from '@/payload-types';
import LatestPostsFeed from './LatestPostsFeed';

const articleTypeGroup: TagGroup = {
    id: 'article-type',
    name: 'Article type',
    slug: 'article-type',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
};

const reviewTypeGroup: TagGroup = {
    id: 'review-type',
    name: 'Review type',
    slug: 'review-type',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
};

const makeTag = (slug: string, name: string, tag: string, group = articleTypeGroup): Tag => ({
    id: slug,
    name,
    tag,
    slug,
    tagGroup: group,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
});

const storyPosts: { id: string; title: string; tag: Tag }[] = [
    {
        id: 'article-1',
        title: 'Dette er ikke din fars nosserock – det er ægte rock',
        tag: makeTag('review', 'Review', 'Anmeldelse'),
    },
    {
        id: 'article-2',
        title: 'Hvis du elsker gys og ødelæggelse, skal du opleve John Maus',
        tag: makeTag('concert', 'Concert', 'Koncert', reviewTypeGroup),
    },
    {
        id: 'article-3',
        title: 'December rammer blødt',
        tag: makeTag('weekly-releases', 'Weekly releases', 'Ugens udgivelser'),
    },
    {
        id: 'article-4',
        title: 'November holder os varme',
        tag: makeTag('weekly-releases', 'Weekly releases', 'Ugens udgivelser'),
    },
];

const posts: ArticleCardPost[] = storyPosts.map(({ id, title, tag }, index) => ({
    id,
    slug: id,
    title,
    tags: [tag],
    publishedAt: new Date(Date.UTC(2026, 8, 28 - index)).toISOString(),
    contentMeta: { featuredImage: { ...imageMock, id: `image-${id}` } },
}));

const meta = {
    title: 'Organisms/Blocks/LatestPosts',
    component: LatestPostsFeed,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    args: { heading: 'Seneste artikler', posts, locale: 'da' },
} satisfies Meta<typeof LatestPostsFeed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FourPosts: Story = {};

export const TwoPosts: Story = {
    args: { posts: posts.slice(0, 2) },
};
