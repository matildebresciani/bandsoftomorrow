import Link from 'next/link';
import TagBadge from '@/components/atoms/frontend/labels/TagBadge';
import { cn } from '@/lib/utilities/ui';
import { ArticleCardImage, type ArticleCardProps, getArticleCardData } from './article-card-shared';

const ArticleCardSmall = ({ post, locale, className }: ArticleCardProps) => {
    const { href, tag, date } = getArticleCardData(post, locale);
    if (!href) return null;

    return (
        <Link
            href={href}
            className={cn(
                'group grid h-full grid-cols-5 gap-4 border border-border-base bg-transparent p-m transition-colors duration-300 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight motion-reduce:transition-none',
                className,
            )}
        >
            <ArticleCardImage
                post={post}
                className="col-span-2 aspect-square self-start"
                sizes="(max-width: 767px) 40vw, 240px"
            />
            <div className="col-span-3 min-w-0">
                {tag && <TagBadge tag={tag} className="mb-s" />}
                <div className="body-md mb-s">
                    {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
                </div>
                <h3 className="heading-4">{post.title}</h3>
            </div>
        </Link>
    );
};

export default ArticleCardSmall;
