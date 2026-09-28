import type { TagBadgeTag } from '@/components/atoms/frontend/labels/tag-badge';
import type { Media } from '@/payload-types';

/** Data sent to the interactive slider after the server has resolved selected Posts. */
export type EditorialHeroSlide = {
    id: string;
    href: string;
    title: string;
    image: Media;
    badge: TagBadgeTag | null;
    date: string | null;
    excerpt: string | null;
};
