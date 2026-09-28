import Link from 'next/link';
import TagBadge from '@/components/atoms/frontend/labels/TagBadge';
import { cn } from '@/lib/utilities/ui';
import { ArticleCardImage, type ArticleCardProps, getArticleCardData } from './article-card-shared';

const ArticleCardFeatured = ({ post, locale, className }: ArticleCardProps) => {
    const { href, tag, date } = getArticleCardData(post, locale);
    if (!href) return null;

    return (
        <Link
            href={href}
            className={cn(
                'group grid grid-cols-12 border border-border-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight',
                className,
            )}
        >
            <div className="order-2 col-span-12 flex flex-col bg-transparent p-m transition-colors duration-300 group-hover:bg-black/10 md:order-1 md:col-span-5 md:p-l motion-reduce:transition-none">
                <div className="mb-s body-md">
                    {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
                </div>
                <h2 className="heading-3 mb-m uppercase">{post.title}</h2>
                {post.contentMeta?.excerpt && <p className="mb-m">{post.contentMeta.excerpt}</p>}
                <span className="button-text mt-auto w-fit bg-button-primary p-s text-button-text">
                    {locale === 'da' ? 'Læs artikel' : 'Read article'}
                </span>
            </div>
            <div className="relative order-1 col-span-12 border-b border-border-base md:order-2 md:col-span-7 md:border-b-0 md:border-l">
                <ArticleCardImage
                    post={post}
                    className="min-h-[300px] h-full md:min-h-[500px]"
                    sizes="(max-width: 767px) 100vw, 58vw"
                />
                {tag && <TagBadge tag={tag} className="absolute top-4 left-4 z-10" />}
            </div>
        </Link>
    );
};

export default ArticleCardFeatured;
