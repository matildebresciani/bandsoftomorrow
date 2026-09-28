import { revalidateTag } from 'next/cache';
import type {
    CollectionAfterChangeHook,
    CollectionAfterDeleteHook,
    CollectionSlug,
    GlobalAfterChangeHook,
    GlobalSlug,
} from 'payload';
import { revalidateEntry } from '../utilities/entry-revalidation';

export const createAfterChangeRevalidateHook = (slug: CollectionSlug): CollectionAfterChangeHook => {
    return ({ doc, previousDoc, req: { context } }) => {
        if (!context.disableRevalidate) {
            const isPublished = doc.publishStatus === 'public' || doc._status === 'published';
            const wasPublished = previousDoc?.publishStatus === 'public' || previousDoc?._status === 'published';
            const hasPublicationState = 'publishStatus' in doc || '_status' in doc;
            if (isPublished || !hasPublicationState) {
                revalidateEntry(doc, slug);
            }

            // If the page was previously published, we need to revalidate the old path
            if (wasPublished && (!isPublished || previousDoc.slug !== doc.slug)) {
                revalidateEntry(previousDoc, slug);
            }
        }
        return doc;
    };
};

export const createAfterDeleteRevalidateHook = (slug: CollectionSlug): CollectionAfterDeleteHook => {
    return ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) {
            revalidateEntry(doc, slug);
        }

        return doc;
    };
};

export const createGlobalAfterChangeRevalidateHook = (slug: GlobalSlug): GlobalAfterChangeHook => {
    return () => {
        revalidateTag(slug, 'max');
    };
};
