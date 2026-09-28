import type { CollectionConfig, Field, SelectField } from 'payload';
import { slugField } from '@/components/molecules/admin/fields/slug';
import { isFrontendRoutedCollection, type RoutedCollectionSlug } from '@/i18n/localized-collections';
import { contentMeta } from '../field-templates/content-meta';
import { payloadLivePreview } from '../field-templates/live-preview';
import { payloadPublishedAt, payloadPublishStatus } from '../field-templates/publish-state';
import { payloadTitleCollection } from '../field-templates/title';
import { generatePreviewPath } from '../utilities/generate-preview-path';
import { createCollection } from './collection';

/** Overrides for routed records that do not use the standard page identity and content metadata. */
type RoutedCollectionOptions = {
    identityFields?: Field[];
    slugSource?: string;
    hasContentMeta?: boolean;
    publishStatusOptions?: SelectField['options'];
};

/** Adds shared routing and publication fields while retaining the standard page defaults. */
export const createRoutedCollection = <Slug extends RoutedCollectionSlug>(
    slug: Slug,
    config: Omit<CollectionConfig<Slug>, 'slug'>,
    options: RoutedCollectionOptions = {},
): CollectionConfig<Slug> => {
    const {
        identityFields = payloadTitleCollection,
        slugSource = 'title',
        hasContentMeta = true,
        publishStatusOptions = payloadPublishStatus.options,
    } = options;
    const previewAdmin: CollectionConfig<Slug>['admin'] = isFrontendRoutedCollection(slug)
        ? {
              livePreview: payloadLivePreview(slug),
              preview: (data, { req }) =>
                  generatePreviewPath({
                      slug: data?.slug,
                      collection: slug,
                      req,
                  }),
          }
        : {};

    return createCollection(slug, {
        ...config,
        admin: {
            useAsTitle: 'name',
            ...previewAdmin,
            ...config.admin,
        },
        fields: [
            ...identityFields,
            ...config.fields,
            payloadPublishedAt,
            { ...payloadPublishStatus, options: publishStatusOptions },
            ...slugField(slugSource),
            ...(hasContentMeta ? [contentMeta()] : []),
        ],
        versions: {
            maxPerDoc: 50,
        },
    });
};
