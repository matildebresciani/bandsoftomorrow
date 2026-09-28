import { defaultLocale } from '@/i18n/localized-collections';
import { getCachedLatestPosts } from '@/lib/data/payload/get-cached-latest-posts';
import type { BC } from '@/lib/types/block-props';
import type { LatestPosts as LatestPostsProps } from '@/payload-types';
import LatestPostsFeed from './LatestPostsFeed';

const LatestPostsBlock: BC<LatestPostsProps> = async ({ block, locale = defaultLocale }) => {
    const posts = await getCachedLatestPosts(locale);
    if (posts.length === 0) return null;

    return <LatestPostsFeed heading={block.heading} posts={posts} locale={locale} />;
};

export default LatestPostsBlock;
