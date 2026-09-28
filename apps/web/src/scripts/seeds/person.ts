import type { Payload } from 'payload';
import { findExistingId } from './find-existing';

export const seedPerson = async (payload: Payload): Promise<string> => {
    const existingId = await findExistingId(payload, 'people', 'name', 'Example Author');
    if (existingId) return existingId;

    const person = await payload.create({
        collection: 'people',
        locale: 'da',
        data: {
            name: 'Example Author',
            role: 'Skribent',
            slug: 'example-author',
            publishStatus: 'public',
        },
        context: { disableRevalidate: true },
    });
    await payload.update({
        collection: 'people',
        id: person.id,
        locale: 'en',
        data: { role: 'Writer', slug: 'example-author', publishStatus: 'public' },
        context: { disableRevalidate: true },
    });
    return person.id;
};
