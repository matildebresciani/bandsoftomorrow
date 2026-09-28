import type { Payload } from 'payload';
import type { Post } from '@/payload-types';

/** Adds the English publication fields once, without replacing later editorial changes. */
export const seedEnglishPost = async (
    payload: Payload,
    id: string,
    data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
    const existing = await payload.findByID({
        collection: 'posts',
        id,
        locale: 'en',
        fallbackLocale: false,
        depth: 0,
        overrideAccess: true,
    });
    if (existing.slug) return;

    await payload.update({
        collection: 'posts',
        id,
        locale: 'en',
        data,
        draft: false,
        context: { disableRevalidate: true },
    });
};
