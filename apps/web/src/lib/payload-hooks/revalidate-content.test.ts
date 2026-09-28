import assert from 'node:assert/strict';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { revalidateTag } from 'next/cache';
import { BasePayload, buildConfig, createLocalReq, type PayloadRequest, type SanitizedCollectionConfig } from 'payload';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Tags } from '@/collections/taxonomies/tags/config';
import { createAfterChangeRevalidateHook, createAfterDeleteRevalidateHook } from './revalidate-content';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

let collection: SanitizedCollectionConfig;
let req: PayloadRequest;

beforeAll(async () => {
    const payload = new BasePayload();
    payload.config = await buildConfig({
        secret: 'archive-revalidation-test',
        db: mongooseAdapter({ url: 'mongodb://127.0.0.1/unused-archive-tests' }),
        collections: [{ slug: 'posts', fields: [] }],
    });
    const posts = payload.config.collections.find((entry) => entry.slug === 'posts');
    assert(posts);
    collection = posts;
    req = await createLocalReq({}, payload);
});

describe('archive cache invalidation', () => {
    it.each([
        ['draft', 'public'],
        ['public', 'public'],
        ['public', 'draft'],
    ])('expires post listings immediately when publication changes from %s to %s', async (before, after) => {
        await createAfterChangeRevalidateHook('posts')({
            collection,
            req,
            context: {},
            data: {},
            operation: 'update',
            previousDoc: { id: 'post', slug: 'review', publishStatus: before },
            doc: { id: 'post', slug: 'review', publishStatus: after, tags: ['rock'] },
        });
        expect(revalidateTag).toHaveBeenCalledWith('posts', { expire: 0 });
    });

    it('expires tag lookups and sitemaps on renaming an unversioned tag', async () => {
        await createAfterChangeRevalidateHook('tags')({
            collection,
            req,
            context: {},
            data: {},
            operation: 'update',
            previousDoc: { id: 'tag', slug: 'old' },
            doc: { id: 'tag', slug: 'new' },
        });
        expect(revalidateTag).toHaveBeenCalledWith('tags', { expire: 0 });
    });

    it.each(['posts', 'tags'] as const)('expires deleted %s immediately', async (slug) => {
        await createAfterDeleteRevalidateHook(slug)({
            collection,
            req,
            context: {},
            id: 'entry',
            doc: { id: 'entry', slug: 'old' },
        });
        expect(revalidateTag).toHaveBeenCalledWith(slug, { expire: 0 });
    });

    it('keeps duplicate tag slugs constrained per locale', () => {
        expect(Tags.fields.find((field) => 'name' in field && field.name === 'slug')).toMatchObject({
            localized: true,
            unique: true,
        });
    });
});
