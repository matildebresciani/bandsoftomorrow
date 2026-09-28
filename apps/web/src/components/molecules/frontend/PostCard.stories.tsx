import type { Meta, StoryObj } from '@storybook/nextjs';
import { imageMock } from '@/__mocks__/storybook-mocks';
import type { Post, Tag, TagGroup } from '@/payload-types';
import PostCard from './PostCard';

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

const genreGroup: TagGroup = {
    id: 'genre',
    name: 'Genre',
    slug: 'genre',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
};

const makeTag = (id: string, name: string, label: string, group: TagGroup): Tag => ({
    id,
    name,
    tag: label,
    slug: id,
    tagGroup: group,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
});

const reviewTag = makeTag('review', 'Review', 'Anmeldelse', articleTypeGroup);
const concertTag = makeTag('concert', 'Concert', 'Koncert', reviewTypeGroup);
const interviewTag = makeTag('interview', 'Interview', 'Interview', articleTypeGroup);
const weeklyTag = makeTag('weekly-releases', 'Weekly releases', 'Ugens udgivelser', articleTypeGroup);
const rockTag = makeTag('rock', 'Rock', 'Rock', genreGroup);

const makePost = (id: string, title: string, tags: Tag[], excerpt?: string): Post => ({
    id,
    name: title,
    title,
    slug: id,
    tags,
    publishedAt: '2026-09-28T12:00:00.000Z',
    publishStatus: 'public',
    contentMeta: {
        featuredImage: { ...imageMock, id: `image-${id}` },
        excerpt,
    },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-28T12:00:00.000Z',
});

const meta = {
    title: 'Molecules/Frontend/ArticleCard',
    component: PostCard,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        locale: 'da',
        variant: 'medium',
        post: makePost('story-medium', 'Nye stemmer på den danske musikscene', [interviewTag, rockTag]),
    },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Featured: Story = {
    args: {
        variant: 'featured',
        post: makePost(
            'story-featured',
            'En koncert der bliver siddende længe efter sidste nummer',
            [rockTag, reviewTag, concertTag],
            'En aften med stærke sange, store øjeblikke og et publikum, der sang med hele vejen.',
        ),
    },
    render: (args) => (
        <div className="mx-auto max-w-[1280px] p-m md:p-l">
            <PostCard {...args} />
        </div>
    ),
};

export const Large: Story = {
    args: {
        variant: 'large',
        post: makePost('story-large', 'Ugens udgivelser er klar til din spilleliste', [weeklyTag, rockTag]),
    },
    render: (args) => (
        <div className="mx-auto max-w-[700px] p-m md:p-l">
            <PostCard {...args} />
        </div>
    ),
};

export const Medium: Story = {
    render: (args) => (
        <div className="mx-auto max-w-[450px] p-m md:p-l">
            <PostCard {...args} />
        </div>
    ),
};

export const Small: Story = {
    args: {
        variant: 'small',
        post: makePost('story-small', 'Mød et af morgendagens nye bands', [interviewTag, rockTag]),
    },
    render: (args) => (
        <div className="mx-auto max-w-[650px] p-m md:p-l">
            <PostCard {...args} />
        </div>
    ),
};
