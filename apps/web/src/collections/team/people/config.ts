import { createRoutedCollection } from '@/lib/collection-templates/routed-collection';
import { payloadRichText } from '@/lib/field-templates/rich-text';
import { populatePersonPublishedAt } from './hooks/populate-published-at';

export const People = createRoutedCollection(
    'people',
    {
        labels: {
            singular: 'Person',
            plural: 'People',
        },
        admin: {
            group: 'Team',
            useAsTitle: 'name',
            defaultColumns: ['name', 'role', 'publishStatus', 'updatedAt'],
        },
        fields: [
            {
                name: 'role',
                type: 'text',
                localized: true,
            },
            {
                name: 'email',
                type: 'email',
                access: {
                    read: ({ req }) => Boolean(req.user),
                },
            },
            {
                name: 'profilePicture',
                label: 'Profile Picture',
                type: 'upload',
                relationTo: 'media',
            },
            payloadRichText({ name: 'description', label: 'Description' }),
        ],
        hooks: {
            beforeChange: [populatePersonPublishedAt],
        },
    },
    {
        identityFields: [
            {
                name: 'name',
                type: 'text',
                required: true,
            },
        ],
        slugSource: 'name',
        hasContentMeta: false,
        publishStatusOptions: [
            { label: 'Draft', value: 'draft' },
            { label: 'Public', value: 'public' },
        ],
    },
);
