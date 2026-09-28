import type { SanitizedConfig } from 'payload';
import { getPayload } from 'payload';
import { seedEnglishPage } from './english-page';
import { seedEnglishPost } from './english-post';
import { findExistingId } from './find-existing';
import { seedMedia } from './image-seed';
import { getMainMenuSeed } from './main-menu';
import { getPage1Seed } from './page-1';
import { getPage2Seed } from './page-2';
import { seedPerson } from './person';
import { getPost1Seed } from './post-1';
import { getPost2Seed } from './post-2';
import { seedTaxonomy } from './taxonomy';

export const script = async (config: SanitizedConfig) => {
    try {
        const payload = await getPayload({ config });

        payload.logger.info('Seeding starter content...');

        const mediaId = await seedMedia(payload);
        const authorId = await seedPerson(payload);
        const { newsId, reviewId, rockId } = await seedTaxonomy(payload);

        const page1Id =
            (await findExistingId(payload, 'pages', 'name', 'Forside')) ??
            (
                await payload.create({
                    collection: 'pages',
                    data: getPage1Seed(mediaId),
                    draft: false,
                    context: { disableRevalidate: true },
                })
            ).id;

        const page2Id =
            (await findExistingId(payload, 'pages', 'name', 'Side 2')) ??
            (
                await payload.create({
                    collection: 'pages',
                    data: getPage2Seed(mediaId),
                    draft: false,
                    context: { disableRevalidate: true },
                })
            ).id;

        await seedEnglishPage(payload, page1Id, { ...getPage1Seed(mediaId), title: 'Home' });
        await seedEnglishPage(payload, page2Id, { ...getPage2Seed(mediaId), title: 'Page 2' });

        const post1Id =
            (await findExistingId(payload, 'posts', 'name', 'Example post: New music')) ??
            (
                await payload.create({
                    collection: 'posts',
                    data: getPost1Seed(mediaId, authorId, [newsId, rockId]),
                    draft: false,
                    context: { disableRevalidate: true },
                })
            ).id;

        const post2Id =
            (await findExistingId(payload, 'posts', 'name', 'Example post: Live music')) ??
            (
                await payload.create({
                    collection: 'posts',
                    data: getPost2Seed(mediaId, authorId, [reviewId, rockId]),
                    draft: false,
                    context: { disableRevalidate: true },
                })
            ).id;

        await seedEnglishPost(payload, post1Id, getPost1Seed(mediaId, authorId, [newsId, rockId]));
        await seedEnglishPost(payload, post2Id, getPost2Seed(mediaId, authorId, [reviewId, rockId]));

        if (!(await findExistingId(payload, 'navigation', 'title', 'Main Menu'))) {
            await payload.create({
                collection: 'navigation',
                data: getMainMenuSeed({ page1Id, page2Id, post1Id, post2Id }),
                draft: false,
                context: { disableRevalidate: true },
            });
        }

        payload.logger.info('Successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error while seeding:', error);
        process.exit(1);
    }
};
