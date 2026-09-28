import Link from 'next/link';
import TagBadge from '@/components/atoms/frontend/labels/TagBadge';
import { cn } from '@/lib/utilities/ui';
import {
    ArticleCardImage,
    type ArticleCardProps,
    articleCardImageSizes,
    getArticleCardData,
} from './article-card-shared';

const ArticleCardMedium = ({ post, locale, className }: ArticleCardProps) => {
    const { href, tag, date } = getArticleCardData(post, locale);
    if (!href) return null;

    return (
        <Link
            href={href}
            className={cn(
                'group flex h-full flex-col border border-border-base bg-transparent transition-colors duration-300 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight motion-reduce:transition-none',
                className,
            )}
        >
            <div className="relative border-b border-border-base">
                <ArticleCardImage post={post} className="aspect-square" sizes={articleCardImageSizes} />
                {tag && <TagBadge tag={tag} className="absolute top-4 left-4 z-10" />}
            </div>
            <div className="flex flex-col gap-s p-s pb-m">
                <div className="body-sm">{date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}</div>
                <h3 className="heading-4">{post.title}</h3>
            </div>
        </Link>
    );
};

export default ArticleCardMedium;
