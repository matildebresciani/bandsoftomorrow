import type { Tag } from '@/payload-types';

/** The small, serializable part of a tag needed by editorial badges. */
export type TagBadgeTag = {
    label: string;
    name: string;
    slug: string | null;
    groupName: string | null;
    groupSlug: string | null;
};

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase().replaceAll(/\s+/g, '-') ?? '';

/** Matches stable editorial slugs, with internal names as a fallback for localized slugs. */
export const matchesTagType = (tag: TagBadgeTag, group: string, type?: string) => {
    const matchesGroup = [tag.groupSlug, tag.groupName].some((value) => normalize(value) === group);
    if (!matchesGroup) return false;
    return !type || [tag.slug, tag.name].some((value) => normalize(value) === type);
};

/** Converts a populated Payload relationship into badge data without passing joins to the client. */
export const toTagBadgeTag = (tag: Tag): TagBadgeTag => {
    const group = typeof tag.tagGroup === 'object' ? tag.tagGroup : null;

    return {
        label: tag.tag?.trim() || tag.name,
        name: tag.name,
        slug: tag.slug ?? null,
        groupName: group?.name ?? null,
        groupSlug: group?.slug ?? null,
    };
};

export const getTagBadgeVariant = (tag: TagBadgeTag): 'red' | 'dark' | 'lightblue' | 'blue' | 'neutral' => {
    if (matchesTagType(tag, 'review-type', 'concert') || matchesTagType(tag, 'article-type', 'review')) {
        return 'red';
    }
    if (matchesTagType(tag, 'article-type', 'interview')) return 'dark';
    if (matchesTagType(tag, 'article-type', 'weekly-releases')) return 'lightblue';
    if (matchesTagType(tag, 'review-type', 'album')) return 'blue';
    return 'neutral';
};
