import type { Payload } from 'payload';
import { findExistingId } from './find-existing';

type LocalizedSeed = {
    name: string;
    da: string;
    en: string;
    daSlug: string;
    enSlug: string;
};

const seedTagGroup = async (payload: Payload, seed: LocalizedSeed): Promise<string> => {
    const existingId = await findExistingId(payload, 'tag-groups', 'name', seed.name);
    if (existingId) return existingId;

    const group = await payload.create({
        collection: 'tag-groups',
        locale: 'da',
        data: {
            name: seed.name,
            tagGroup: seed.da,
            slug: seed.daSlug,
            collectionsOnTagGroup: ['posts'],
        },
        context: { disableRevalidate: true },
    });
    await payload.update({
        collection: 'tag-groups',
        id: group.id,
        locale: 'en',
        data: { tagGroup: seed.en, slug: seed.enSlug },
        context: { disableRevalidate: true },
    });
    return group.id;
};

const seedTag = async (payload: Payload, seed: LocalizedSeed, tagGroup: string): Promise<string> => {
    const existingId = await findExistingId(payload, 'tags', 'name', seed.name);
    if (existingId) return existingId;

    const tag = await payload.create({
        collection: 'tags',
        locale: 'da',
        data: {
            name: seed.name,
            tag: seed.da,
            tagGroup,
            slug: seed.daSlug,
        },
        context: { disableRevalidate: true },
    });
    await payload.update({
        collection: 'tags',
        id: tag.id,
        locale: 'en',
        data: { tag: seed.en, slug: seed.enSlug },
        context: { disableRevalidate: true },
    });
    return tag.id;
};

export const seedTaxonomy = async (payload: Payload) => {
    const articleTypeId = await seedTagGroup(payload, {
        name: 'Article type',
        da: 'Artikeltype',
        en: 'Article type',
        daSlug: 'artikeltype',
        enSlug: 'article-type',
    });
    await seedTagGroup(payload, {
        name: 'Review type',
        da: 'Anmeldelsestype',
        en: 'Review type',
        daSlug: 'anmeldelsestype',
        enSlug: 'review-type',
    });
    const genreId = await seedTagGroup(payload, {
        name: 'Genre',
        da: 'Genre',
        en: 'Genre',
        daSlug: 'genre',
        enSlug: 'genre',
    });
    await seedTagGroup(payload, {
        name: 'Topic',
        da: 'Emne',
        en: 'Topic',
        daSlug: 'emne',
        enSlug: 'topic',
    });
    await seedTagGroup(payload, {
        name: 'Artist',
        da: 'Kunstner',
        en: 'Artist',
        daSlug: 'kunstner',
        enSlug: 'artist',
    });

    const newsId = await seedTag(
        payload,
        { name: 'News', da: 'Nyheder', en: 'News', daSlug: 'nyheder', enSlug: 'news' },
        articleTypeId,
    );
    const reviewId = await seedTag(
        payload,
        { name: 'Review', da: 'Anmeldelse', en: 'Review', daSlug: 'anmeldelse', enSlug: 'review' },
        articleTypeId,
    );
    const rockId = await seedTag(
        payload,
        { name: 'Rock', da: 'Rock', en: 'Rock', daSlug: 'rock', enSlug: 'rock' },
        genreId,
    );

    return { newsId, reviewId, rockId };
};
