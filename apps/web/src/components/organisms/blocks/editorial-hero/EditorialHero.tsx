import { defaultLocale } from '@/i18n/localized-collections';
import { getCachedEntriesByIds } from '@/lib/data/payload/get-cached-entries-by-ids';
import type { BC } from '@/lib/types/block-props';
import { getPayloadIds } from '@/lib/utilities/composables';
import { formatLinkByCollection } from '@/lib/utilities/format-link';
import { selectEditorialTag } from '@/lib/utilities/select-editorial-tag';
import type { EditorialHero as EditorialHeroProps } from '@/payload-types';
import BaseBlock from '../base-block/BaseBlock';
import EditorialHeroSlider from './EditorialHeroSlider';
import type { EditorialHeroSlide } from './types';

const formatHeroDate = (value: string | null | undefined, locale: 'da' | 'en'): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Copenhagen',
    }).format(date);
};

const EditorialHeroBlock: BC<EditorialHeroProps> = async ({ block, locale = defaultLocale }) => {
    const ids = [...new Set(getPayloadIds(block.featuredPosts))];
    const posts = await getCachedEntriesByIds({
        collection: 'posts',
        ids,
        locale,
        sortByIds: true,
        additionalCacheTags: ['tags', 'tag-groups'],
        select: {
            title: true,
            slug: true,
            publishedAt: true,
            tags: true,
            contentMeta: { featuredImage: true, excerpt: true },
        },
    });

    const slides: EditorialHeroSlide[] = (posts ?? []).flatMap((post) => {
        const image = post.contentMeta?.featuredImage;
        const href = formatLinkByCollection(post.slug, 'posts', locale);
        if (!href || !image || typeof image !== 'object' || !image.url) return [];

        return [
            {
                id: post.id,
                href,
                title: post.title,
                image,
                badge: selectEditorialTag(post.tags),
                date: formatHeroDate(post.publishedAt, locale),
                excerpt: post.contentMeta?.excerpt ?? null,
            },
        ];
    });

    if (slides.length === 0) return null;

    return (
        <BaseBlock className="!max-w-full !p-0" classNameOuter="!p-0">
            <EditorialHeroSlider slides={slides} locale={locale} />
        </BaseBlock>
    );
};

export default EditorialHeroBlock;
