import { createBlock } from '@/lib/block-templates/block';

export const LatestPosts = createBlock('latest-posts', {
    interfaceName: 'LatestPosts',
    labels: {
        singular: 'Latest Posts',
        plural: 'Latest Posts',
    },
    fields: [
        {
            name: 'heading',
            label: 'Heading',
            type: 'text',
            localized: true,
            required: true,
        },
    ],
});
