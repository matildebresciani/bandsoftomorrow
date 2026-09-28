import { createBlock } from '@/lib/block-templates/block';

export const EditorialHero = createBlock('editorial-hero', {
    interfaceName: 'EditorialHero',
    imageURL: '/images/block-thumbnails/editorial-hero.png',
    labels: {
        singular: 'Editorial Hero',
        plural: 'Editorial Heroes',
    },
    fields: [
        {
            name: 'featuredPosts',
            label: 'Featured Posts',
            type: 'relationship',
            relationTo: 'posts',
            hasMany: true,
            required: true,
            minRows: 1,
            maxRows: 5,
            filterOptions: () => ({ publishStatus: { equals: 'public' } }),
            admin: {
                description: 'Choose 1–5 public posts with featured images. Drag to set slide order.',
                isSortable: true,
            },
        },
    ],
});
