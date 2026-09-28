import type { Payload } from 'payload';
import type { Page } from '@/payload-types';

/** Fills a missing English seed page without changing one that editors have populated. */
export const seedEnglishPage = async (
    payload: Payload,
    id: string,
    data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
    const existing = await payload.findByID({
        collection: 'pages',
        id,
        locale: 'en',
        fallbackLocale: false,
        depth: 0,
        overrideAccess: true,
    });
    if (existing.layout?.length) return;

    await payload.update({
        collection: 'pages',
        id,
        locale: 'en',
        data,
        draft: false,
        context: { disableRevalidate: true },
    });
};
