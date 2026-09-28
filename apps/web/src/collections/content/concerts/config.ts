import { anyone } from '@/access/anyone';
import { createCollection } from '@/lib/collection-templates/collection';

export const Concerts = createCollection('concerts', {
    access: {
        read: anyone,
    },
    admin: {
        group: 'Content',
        useAsTitle: 'artist',
        defaultColumns: ['artist', 'date', 'venue', 'city'],
    },
    labels: {
        singular: 'Concert',
        plural: 'Concerts',
    },
    fields: [
        {
            name: 'featuredImage',
            label: 'Featured Image',
            type: 'upload',
            relationTo: 'media',
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'artist',
                    label: 'Artist',
                    type: 'text',
                },
                {
                    name: 'support',
                    label: 'Support Act',
                    type: 'text',
                },
            ],
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'venue',
                    label: 'Venue',
                    type: 'text',
                },
                {
                    name: 'city',
                    label: 'City',
                    type: 'text',
                },
            ],
        },
        {
            name: 'date',
            label: 'Date',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayOnly',
                    displayFormat: 'd MMMM yyyy',
                },
            },
        },
        {
            name: 'ticketLink',
            label: 'Ticket Link',
            type: 'text',
        },
    ],
});
