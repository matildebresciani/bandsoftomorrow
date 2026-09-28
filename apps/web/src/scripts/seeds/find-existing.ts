import type { CollectionSlug, Payload } from 'payload';

/** Keeps starter records editable by leaving existing documents untouched on later seed runs. */
export const findExistingId = async (
    payload: Payload,
    collection: CollectionSlug,
    field: 'filename' | 'name' | 'title',
    value: string,
): Promise<string | undefined> => {
    const result = await payload.find({
        collection,
        where: { [field]: { equals: value } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        pagination: false,
    });

    return result.docs[0]?.id;
};
