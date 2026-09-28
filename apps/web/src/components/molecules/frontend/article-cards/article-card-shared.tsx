import { DateTime } from 'luxon';
import { matchesTagType, toTagBadgeTag } from '@/components/atoms/frontend/labels/tag-badge';
import { ImageMedia } from '@/components/atoms/frontend/media/ImageMedia';
import type { Locale } from '@/i18n/localized-collections';
import { formatLinkByCollection } from '@/lib/utilities/format-link';
import { selectEditorialTag } from '@/lib/utilities/select-editorial-tag';
import { cn } from '@/lib/utilities/ui';
import type { Post } from '@/payload-types';

/** Fields used by every article card, including cards backed by a selective feed query. */
export type ArticleCardPost = Pick<Post, 'id' | 'title' | 'slug' | 'publishedAt' | 'tags' | 'contentMeta'>;

export type ArticleCardProps = {
    post: ArticleCardPost;
    locale: Locale;
    className?: string;
    headingLevel?: 2 | 3;
};

export const getArticleCardData = (post: ArticleCardPost, locale: Locale) => {
    const eligibleTags = post.tags?.filter((tag) => {
        if (typeof tag !== 'object' || tag === null) return false;
        const badgeTag = toTagBadgeTag(tag);
        return matchesTagType(badgeTag, 'article-type') || matchesTagType(badgeTag, 'review-type');
    });

    const date = post.publishedAt
        ? DateTime.fromISO(post.publishedAt).setZone('Europe/Copenhagen').setLocale(locale)
        : null;

    return {
        href: formatLinkByCollection(post.slug, 'posts', locale),
        tag: selectEditorialTag(eligibleTags),
        date: date?.isValid ? date.toFormat('dd. LLLL, yyyy') : null,
    };
};

export const ArticleCardImage = ({
    post,
    className,
    sizes,
}: {
    post: ArticleCardPost;
    className?: string;
    sizes: string;
}) => {
    const image = post.contentMeta?.featuredImage;

    return (
        <div className={cn('relative w-full overflow-hidden bg-bg-subtle', className)}>
            {image && typeof image === 'object' && image.url && (
                <ImageMedia
                    resource={image}
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.12] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    size={sizes}
                />
            )}
        </div>
    );
};

export const articleCardImageSizes = '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw';
