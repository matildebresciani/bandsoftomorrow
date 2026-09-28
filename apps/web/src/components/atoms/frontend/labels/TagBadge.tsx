// biome-ignore lint/style/useImportType: Vitest uses the classic JSX transform for this rendered component test.
import React from 'react';
import { cn } from '@/lib/utilities/ui';
import { getTagBadgeVariant, type TagBadgeTag } from './tag-badge';

const variantClasses = {
    red: 'bg-bg-label-red text-fg-on-color',
    dark: 'bg-bg-label-dark text-fg-on-color',
    lightblue: 'bg-bg-label-lightblue text-fg-base',
    blue: 'bg-bg-label-blue text-fg-on-color',
    neutral: 'bg-bg-base text-fg-base',
};

/** Displays a localized editorial tag using its type's established color. */
const TagBadge: React.FC<{ tag: TagBadgeTag; className?: string }> = ({ tag, className }) => (
    <span
        className={cn(
            'inline-flex items-center p-xs label-text uppercase',
            variantClasses[getTagBadgeVariant(tag)],
            className,
        )}
    >
        {tag.label}
    </span>
);

export default TagBadge;
