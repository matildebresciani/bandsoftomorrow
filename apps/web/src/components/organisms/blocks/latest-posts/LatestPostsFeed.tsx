import type { ArticleCardPost } from '@/components/molecules/frontend/article-cards/article-card-shared';
import PostCard from '@/components/molecules/frontend/PostCard';
import type { Locale } from '@/i18n/localized-collections';
import BaseBlock from '../base-block/BaseBlock';

type Props = {
    heading: string;
    posts: ArticleCardPost[];
    locale: Locale;
};

/** Renders the latest post as the lead card and up to three smaller cards beside it. */
const LatestPostsFeed = ({ heading, posts, locale }: Props) => {
    const [leadPost, ...otherPosts] = posts.slice(0, 4);
    if (!leadPost) return null;

    return (
        <BaseBlock>
            <h2 className="heading-1 relative z-0 mb-section-xxs flex justify-center text-center tracking-wider uppercase">
                <span
                    aria-hidden="true"
                    className="absolute z-0 translate-x-[-.4%] text-logo-red md:translate-x-[-.45%]"
                >
                    {heading}
                </span>
                <span className="relative z-10 text-fg-base">{heading}</span>
                <span
                    aria-hidden="true"
                    className="absolute z-0 translate-x-[.4%] text-logo-blue md:translate-x-[.45%]"
                >
                    {heading}
                </span>
            </h2>
            <div className={otherPosts.length > 0 ? 'grid lg:grid-cols-[7fr_5fr]' : 'grid'}>
                <PostCard
                    post={leadPost}
                    locale={locale}
                    variant="large"
                    headingLevel={3}
                    className={otherPosts.length > 0 ? 'lg:border-r-0' : undefined}
                />
                {otherPosts.length > 0 && (
                    <div className="grid auto-rows-fr">
                        {otherPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                locale={locale}
                                variant="small"
                                className="border-t-0 lg:first:border-t"
                            />
                        ))}
                    </div>
                )}
            </div>
        </BaseBlock>
    );
};

export default LatestPostsFeed;
