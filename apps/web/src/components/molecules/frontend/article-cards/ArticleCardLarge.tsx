import Link from 'next/link';
import TagBadge from '@/components/atoms/frontend/labels/TagBadge';
import { cn } from '@/lib/utilities/ui';
import {
    ArticleCardImage,
    type ArticleCardProps,
    articleCardImageSizes,
    getArticleCardData,
} from './article-card-shared';

const ArticleCardLarge = ({ post, locale, className, headingLevel = 2 }: ArticleCardProps) => {
    const { href, tag, date } = getArticleCardData(post, locale);
    if (!href) return null;
    const Heading = headingLevel === 3 ? 'h3' : 'h2';

    return (
        <Link
            href={href}
            className={cn(
                'group flex h-full flex-col border border-border-base bg-transparent transition-colors duration-300 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight motion-reduce:transition-none',
                className,
            )}
        >
            <div className="relative">
                <ArticleCardImage
                    post={post}
                    className="aspect-[4/3] max-h-[400px] border-b border-border-base"
                    sizes={articleCardImageSizes}
                />
                {tag && <TagBadge tag={tag} className="absolute bottom-0 left-m z-10 translate-y-1/2 md:left-l" />}
            </div>
            <div className={cn('p-m md:p-l', tag && 'pt-12 md:pt-12')}>
                <div className="body-md mb-s">
                    {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
                </div>
                <Heading className="heading-4 line-clamp-4 uppercase">{post.title}</Heading>
            </div>
        </Link>
    );
};

export default ArticleCardLarge;
