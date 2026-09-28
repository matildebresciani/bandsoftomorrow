import { anyone } from '@/access/anyone';
import { slugField } from '@/components/molecules/admin/fields/slug';
import { createCollection } from '@/lib/collection-templates/collection';

export const Tags = createCollection('tags', {
    access: {
        read: anyone,
    },
    admin: {
        group: 'Taxonomies',
        useAsTitle: 'tag',
        defaultColumns: ['name', 'slug', 'tagGroup'],
    },
    labels: {
        singular: 'Tag',
        plural: 'Tags',
    },
    fields: [
        {
            name: 'name',
            label: 'Tag Name',
            type: 'text',
            required: true,
            admin: {
                description: 'The internal name of the tag, used only in the admin panel. Not localized.',
            },
        },
        {
            type: 'text',
            name: 'tag',
            label: 'Tag',
            localized: true,
        },
        {
            type: 'relationship',
            name: 'tagGroup',
            label: 'Tag Group',
            relationTo: 'tag-groups',
            required: true,
        },
        {
            name: 'viewPostsInTag',
            label: 'Posts in Tag',
            type: 'join',
            collection: 'posts',
            on: 'tags',
        },
        ...slugField('tag', {
            slugOverrides: {
                unique: true,
            },
        }),
    ],
});
