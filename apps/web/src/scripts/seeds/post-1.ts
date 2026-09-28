import type { Post } from '@/payload-types';
import { seededParagraphBlock } from './paragraph';

export const getPost1Seed = (
    mediaId: string,
    authorId: string,
    tagIds: string[],
): Omit<Post, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
        title: 'Example: New music on the horizon',
        name: 'Example post: New music',
        slug: 'example-new-music',
        publishStatus: 'public',
        layout: [seededParagraphBlock()],
        authors: [authorId],
        tags: tagIds,
        contentMeta: {
            featuredImage: mediaId,
            excerpt: 'A sample editorial post for trying the post archive and tags.',
        },
    };
};
