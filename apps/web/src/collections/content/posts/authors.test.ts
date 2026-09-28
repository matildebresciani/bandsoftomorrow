import assert from 'node:assert/strict';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { BasePayload, buildConfig, type DatabaseAdapter } from 'payload';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { People } from '@/collections/team/people/config';
import { Posts } from './config';

const tabs = Posts.fields.find((field) => field.type === 'tabs');
assert(tabs?.type === 'tabs');
const metadata = tabs.tabs.find((tab) => tab.label === 'Meta');
assert(metadata);
const authors = metadata.fields.find((field) => 'name' in field && field.name === 'authors');
assert(authors?.type === 'relationship');
const publicId = '000000000000000000000001';
const draftId = '000000000000000000000002';
let payload: BasePayload;

beforeAll(async () => {
    // Use Payload's real access, population and field pipeline with only database I/O replaced.
    payload = new BasePayload();
    payload.config = await buildConfig({
        secret: 'post-authors-test-secret',
        db: mongooseAdapter({ url: 'mongodb://127.0.0.1/unused-post-authors-tests' }),
        localization: { defaultLocale: 'da', locales: ['da', 'en'] },
        collections: [
            {
                ...Posts,
                defaultPopulate: undefined,
                forceSelect: undefined,
                fields: [authors, { name: 'name', type: 'text' }, { name: 'publishStatus', type: 'text' }],
            },
            People,
            { slug: 'media', fields: [] },
        ],
    });
    // biome-ignore lint/plugin: Payload's factory type erases adapter extensions; this configured mongooseAdapter supplies the MongoDB DatabaseAdapter.
    payload.db = payload.config.db.init({ payload }) as unknown as DatabaseAdapter;
    for (const config of payload.config.collections) {
        payload.collections[config.slug] = { config, customIDType: 'text' };
    }
});

describe('post author relationships', () => {
    it('uses optional, ordered People relationships and keeps the existing metadata', () => {
        expect(authors).toMatchObject({ relationTo: 'people', hasMany: true, admin: { isSortable: true } });
        expect(authors.required).not.toBe(true);
        expect(authors.filterOptions).toBeUndefined();
        expect(metadata.fields.flatMap((field) => ('name' in field ? [field.name] : []))).toEqual([
            'authors',
            'relatedPosts',
            'tags',
            'categories',
        ]);
        expect(Posts.hooks?.afterRead ?? []).toHaveLength(0);
    });

    it.each([false, true])('populates authors with People access (authenticated: %s)', async (isAuthenticated) => {
        const find = vi.spyOn(payload.db, 'find').mockImplementation(async ({ collection, where }) => {
            const allPeople = [
                { id: publicId, name: 'Public person', publishStatus: 'public', email: 'private@example.com' },
                { id: draftId, name: 'Unpublished person', publishStatus: 'draft', email: 'draft@example.com' },
            ];
            let docs: Record<string, unknown>[] = [
                {
                    id: 'post',
                    publishStatus: 'public',
                    authors: [draftId, publicId],
                },
            ];
            if (collection === 'people') {
                // Assert that Payload really passed the public access predicate to the database.
                if (!isAuthenticated)
                    expect(where).toMatchObject({
                        and: expect.arrayContaining([{ publishStatus: { equals: 'public' } }]),
                    });
                const hasPublicFilter = JSON.stringify(where).includes('publishStatus');
                docs = hasPublicFilter ? allPeople.filter((person) => person.publishStatus === 'public') : allPeople;
            }
            return {
                docs,
                totalDocs: docs.length,
                totalPages: 1,
                page: 1,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false,
                nextPage: null,
                prevPage: null,
                pagingCounter: 1,
            };
        });
        const result = await payload.find({
            collection: 'posts',
            overrideAccess: false,
            depth: 1,
            locale: 'da',
            user: isAuthenticated ? { id: 'editor', collection: 'users', email: 'editor@example.com' } : undefined,
        });
        expect(find.mock.calls.some(([args]) => args.collection === 'people')).toBe(true);
        const ordered = result.docs[0]?.authors;
        if (isAuthenticated) {
            expect(ordered).toEqual([
                expect.objectContaining({ id: draftId, name: 'Unpublished person', email: 'draft@example.com' }),
                expect.objectContaining({ id: publicId, email: 'private@example.com' }),
            ]);
        } else {
            // Payload keeps inaccessible IDs, but never includes the private profile or email.
            expect(ordered).toEqual([draftId, expect.objectContaining({ id: publicId, name: 'Public person' })]);
            expect(JSON.stringify(result.docs)).not.toContain('email');
            expect(JSON.stringify(result.docs)).not.toContain('Unpublished person');
        }
    });
});
