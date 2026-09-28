import { matchesTagType, type TagBadgeTag, toTagBadgeTag } from '@/components/atoms/frontend/labels/tag-badge';
import type { Post, Tag } from '@/payload-types';

/** Picks the post's editorial type while preserving its saved tag order for fallback. */
export const selectEditorialTag = (tags: Post['tags']): TagBadgeTag | null => {
    const populatedTags = tags?.filter((tag): tag is Tag => typeof tag === 'object' && tag !== null) ?? [];
    const badgeTags = populatedTags.map(toTagBadgeTag);
    const articleType = badgeTags.find((tag) => matchesTagType(tag, 'article-type'));

    if (articleType && matchesTagType(articleType, 'article-type', 'review')) {
        const reviewType = badgeTags.find((tag) => matchesTagType(tag, 'review-type'));
        if (reviewType) return reviewType;
    }

    return articleType ?? badgeTags[0] ?? null;
};
