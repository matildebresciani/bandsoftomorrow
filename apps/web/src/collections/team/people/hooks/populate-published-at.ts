import type { CollectionBeforeChangeHook } from 'payload';
import type { Person } from '@/payload-types';

/** Records first publication without resetting the date when a profile is edited or unpublished. */
export const populatePersonPublishedAt: CollectionBeforeChangeHook<Person> = ({ data, originalDoc }) => {
    const publishStatus = data.publishStatus ?? originalDoc?.publishStatus;

    if (publishStatus !== 'public' || data.publishedAt) return data;

    return {
        ...data,
        publishedAt: originalDoc?.publishedAt ?? new Date().toISOString(),
    };
};
