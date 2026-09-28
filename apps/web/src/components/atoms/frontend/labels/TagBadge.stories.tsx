import type { Meta, StoryObj } from '@storybook/nextjs';
import { tagBadgeMocks } from '@/__mocks__/storybook-mocks';
import TagBadge from './TagBadge';

const meta = {
    title: 'Atoms/Frontend/TagBadge',
    component: TagBadge,
    tags: ['autodocs'],
    args: {
        tag: tagBadgeMocks.review,
    },
} satisfies Meta<typeof TagBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Types: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-4 bg-bg-subtle p-m">
            {Object.entries(tagBadgeMocks).map(([type, tag]) => (
                <div key={type} className="flex flex-col items-start gap-2">
                    <span className="body-sm">{type}</span>
                    <TagBadge tag={tag} />
                </div>
            ))}
        </div>
    ),
};
