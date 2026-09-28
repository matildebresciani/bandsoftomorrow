import type { Post } from '@/payload-types';
import { seededParagraphBlock } from './paragraph';

export const getPost2Seed = (
    mediaId: string,
    authorId: string,
    tagIds: string[],
): Omit<Post, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
        title: 'Example: A closer look at live music',
        name: 'Example post: Live music',
        slug: 'example-live-music',
        publishStatus: 'public',
        layout: [seededParagraphBlock()],
        authors: [authorId],
        tags: tagIds,
        contentMeta: {
            featuredImage: mediaId,
            excerpt: 'A second sample editorial post for trying the post archive and tags.',
        },
    };
};
