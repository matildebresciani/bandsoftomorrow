import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { selectEditorialTag } from '@/lib/utilities/select-editorial-tag';
import type { Tag, TagGroup } from '@/payload-types';
import TagBadge from './TagBadge';
import { getTagBadgeVariant, toTagBadgeTag } from './tag-badge';

const group = (name: string, slug: string): TagGroup => ({
    id: slug,
    name,
    slug,
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
});

const tag = (name: string, slug: string, tagGroup: TagGroup, label: string): Tag => ({
    id: `${tagGroup.id}-${slug}`,
    name,
    tag: label,
    slug,
    tagGroup,
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
});

const articleTypes = group('Article type', 'article-type');
const reviewTypes = group('Review type', 'review-type');
const genres = group('Genre', 'genre');

describe('TagBadge', () => {
    it.each([
        [tag('Review', 'review', articleTypes, 'Anmeldelse'), 'red', 'bg-bg-label-red'],
        [tag('Concert', 'concert', reviewTypes, 'Koncert'), 'red', 'bg-bg-label-red'],
        [tag('Interview', 'interview', articleTypes, 'Interview'), 'dark', 'bg-bg-label-dark'],
        [
            tag('Weekly releases', 'weekly-releases', articleTypes, 'Ugens udgivelser'),
            'lightblue',
            'bg-bg-label-lightblue',
        ],
        [tag('Album', 'album', reviewTypes, 'Album'), 'blue', 'bg-bg-label-blue'],
        [tag('Rock', 'rock', genres, 'Rock'), 'neutral', 'bg-bg-base'],
    ] as const)('uses the old color for %s', (item, variant, colorClass) => {
        const badgeTag = toTagBadgeTag(item);
        expect(getTagBadgeVariant(badgeTag)).toBe(variant);
        const html = renderToStaticMarkup(React.createElement(TagBadge, { tag: badgeTag }));
        expect(html).toContain(colorClass);
        expect(html).toContain(item.tag);
    });

    it('uses the localized tag text in Danish and English', () => {
        const danish = toTagBadgeTag(tag('Weekly releases', 'weekly-releases', articleTypes, 'Ugens udgivelser'));
        const english = toTagBadgeTag(tag('Weekly releases', 'weekly-releases', articleTypes, 'Weekly releases'));

        expect(renderToStaticMarkup(React.createElement(TagBadge, { tag: danish }))).toContain('Ugens udgivelser');
        expect(renderToStaticMarkup(React.createElement(TagBadge, { tag: english }))).toContain('Weekly releases');
        expect(getTagBadgeVariant(danish)).toBe(getTagBadgeVariant(english));
    });

    it('prefers a review subtype, then article type, then the first saved tag', () => {
        const rock = tag('Rock', 'rock', genres, 'Rock');
        const review = tag('Review', 'review', articleTypes, 'Anmeldelse');
        const album = tag('Album', 'album', reviewTypes, 'Album');
        const interview = tag('Interview', 'interview', articleTypes, 'Interview');

        expect(selectEditorialTag([rock, review, album])?.label).toBe('Album');
        expect(selectEditorialTag([rock, interview, album])?.label).toBe('Interview');
        expect(selectEditorialTag([rock])?.label).toBe('Rock');
        expect(selectEditorialTag(['unavailable', rock])?.label).toBe('Rock');
        expect(selectEditorialTag([])).toBeNull();
    });

    it('falls back to the internal name if the localized text is absent', () => {
        const interview = tag('Interview', 'interview', articleTypes, '');
        expect(toTagBadgeTag(interview).label).toBe('Interview');
    });
});
