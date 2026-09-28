import { anyone } from '@/access/anyone';
import { slugField } from '@/components/molecules/admin/fields/slug';
import { createCollection } from '@/lib/collection-templates/collection';

export const TagGroups = createCollection('tag-groups', {
    access: {
        read: anyone,
    },
    admin: {
        group: 'Taxonomies',
        useAsTitle: 'tagGroup',
        defaultColumns: ['name', 'slug'],
    },
    labels: {
        singular: 'Tag Group',
        plural: 'Tag Groups',
    },
    fields: [
        {
            name: 'name',
            label: 'Tag Group Name',
            type: 'text',
            required: true,
            admin: {
                description: 'The internal name of the tag group, used only in the admin panel. Not localized.',
            },
        },
        {
            type: 'text',
            name: 'tagGroup',
            label: 'Tag Group',
            localized: true,
        },
        {
            name: 'viewTagsInGroup',
            label: 'Tags in Group',
            type: 'join',
            collection: 'tags',
            on: 'tagGroup',
        },
        ...slugField('tagGroup'),
        {
            type: 'checkbox',
            name: 'showInFiltration',
            label: 'Show in filtration',
            defaultValue: false,
            admin: {
                position: 'sidebar',
            },
        },
        {
            type: 'select',
            name: 'collectionsOnTagGroup',
            label: 'Collections on Tag Group',
            admin: {
                position: 'sidebar',
            },
            hasMany: true,
            options: [
                {
                    label: 'Posts',
                    value: 'posts',
                },
            ],
        },
    ],
});
