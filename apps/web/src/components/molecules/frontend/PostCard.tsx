import type { Equals } from 'ts-toolbelt/out/Any/Equals';
import type { Assert } from '@/lib/types/utilities';
import ArticleCardFeatured from './article-cards/ArticleCardFeatured';
import ArticleCardLarge from './article-cards/ArticleCardLarge';
import ArticleCardMedium from './article-cards/ArticleCardMedium';
import ArticleCardSmall from './article-cards/ArticleCardSmall';
import type { ArticleCardProps } from './article-cards/article-card-shared';

export type PostCardProps = ArticleCardProps & {
    variant?: 'featured' | 'large' | 'medium' | 'small';
};

/** Selects one of the article card layouts. */
const PostCard = ({ variant = 'medium', ...props }: PostCardProps) => {
    switch (variant) {
        case 'featured':
            return <ArticleCardFeatured {...props} />;
        case 'large':
            return <ArticleCardLarge {...props} />;
        case 'medium':
            return <ArticleCardMedium {...props} />;
        case 'small':
            return <ArticleCardSmall {...props} />;
        default: {
            type _ExhaustiveCheck = Assert<Equals<typeof variant, never>>;
            return null;
        }
    }
};

export default PostCard;
