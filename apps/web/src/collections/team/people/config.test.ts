import assert from 'node:assert/strict';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import {
    afterReadPromise,
    BasePayload,
    buildConfig,
    createLocalReq,
    type PayloadRequest,
    type SanitizedCollectionConfig,
} from 'payload';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Person } from '@/payload-types';
import { People } from './config';
import { populatePersonPublishedAt } from './hooks/populate-published-at';

let collection: SanitizedCollectionConfig;
let anonymousRequest: PayloadRequest;
let authenticatedRequest: PayloadRequest;

beforeAll(async () => {
    // Sanitize real fields and create request contexts without connecting to a database.
    const payload = new BasePayload();
    payload.config = await buildConfig({
        secret: 'people-test-secret',
        db: mongooseAdapter({ url: 'mongodb://127.0.0.1/unused-people-tests' }),
        collections: [People, { slug: 'media', fields: [] }],
        localization: { defaultLocale: 'da', locales: ['da', 'en'] },
    });
    const peopleCollection = payload.config.collections.find((entry) => entry.slug === 'people');
    assert(peopleCollection);
    collection = peopleCollection;
    anonymousRequest = await createLocalReq({ locale: 'da' }, payload);
    authenticatedRequest = await createLocalReq(
        {
            locale: 'da',
            user: {
                id: 'editor',
                collection: 'users',
                email: 'editor@example.com',
                createdAt: '',
                updatedAt: '',
            },
        },
        payload,
    );
});

describe('People access', () => {
    it('restricts anonymous reads to public records and allows CMS users to read drafts', async () => {
        assert(collection.access.read);
        expect(await collection.access.read({ req: anonymousRequest })).toEqual({
            publishStatus: { equals: 'public' },
        });
        expect(await collection.access.read({ req: authenticatedRequest })).toBe(true);
    });

    it.each(['create', 'update', 'delete'] as const)('requires authentication to %s people', async (operation) => {
        const access = collection.access[operation];
        assert(access);
        expect(await access({ req: anonymousRequest })).toBe(false);
        expect(await access({ req: authenticatedRequest })).toBe(true);
    });

    it.each([false, true])('applies email access to response data (authenticated: %s)', async (isAuthenticated) => {
        const field = collection.fields.find((entry) => 'name' in entry && entry.name === 'email');
        assert(field);
        const doc: Record<string, string> = { id: 'person', name: 'Alex', email: 'private@example.com' };

        await afterReadPromise({
            collection,
            context: {},
            currentDepth: 1,
            depth: 0,
            doc,
            draft: false,
            fallbackLocale: false,
            field,
            fieldDepth: 0,
            fieldIndex: 0,
            fieldPromises: [],
            findMany: false,
            flattenLocales: true,
            global: null,
            locale: 'da',
            overrideAccess: false,
            parentIndexPath: '',
            parentPath: '',
            parentSchemaPath: '',
            populationPromises: [],
            req: isAuthenticated ? authenticatedRequest : anonymousRequest,
            showHiddenFields: false,
            siblingDoc: doc,
        });

        expect(doc.name).toBe('Alex');
        if (isAuthenticated) {
            expect(doc.email).toBe('private@example.com');
        } else {
            expect(doc).not.toHaveProperty('email');
        }
    });
});

describe('People slugs', () => {
    it.each([
        { name: 'Alex Jensen', value: undefined, expected: 'alex-jensen' },
        { name: 'Alex Jensen', value: 'Custom Profile', expected: 'custom-profile' },
    ])('generates or preserves the editable slug: $expected', async ({ name, value, expected }) => {
        const field = collection.fields.find((entry) => 'name' in entry && entry.name === 'slug');
        assert(field?.type === 'text');
        const hook = field.hooks?.beforeValidate?.[0];
        assert(hook);
        const data = { name };

        expect(
            await hook({
                blockData: undefined,
                collection,
                context: {},
                data,
                field,
                global: null,
                indexPath: [],
                operation: 'create',
                path: ['slug'],
                req: authenticatedRequest,
                schemaPath: ['slug'],
                siblingData: data,
                siblingFields: collection.fields,
                value,
            }),
        ).toBe(expected);
    });
});

describe('People publication dates', () => {
    const originalDoc: Person = {
        id: 'person',
        name: 'Alex',
        publishStatus: 'public',
        publishedAt: '2026-01-01T10:00:00.000Z',
        createdAt: '',
        updatedAt: '',
    };

    it('sets the date on first publication, but not when creating a draft', async () => {
        const args = { collection, context: {}, req: authenticatedRequest, operation: 'create' as const };
        const before = Date.now();
        const published = await populatePersonPublishedAt({ ...args, data: { publishStatus: 'public' } });
        expect(Date.parse(published.publishedAt)).toBeGreaterThanOrEqual(before);
        expect(Date.parse(published.publishedAt)).toBeLessThanOrEqual(Date.now());
        expect(await populatePersonPublishedAt({ ...args, data: { publishStatus: 'draft' } })).not.toHaveProperty(
            'publishedAt',
        );
    });

    it('preserves the original date on updates and respects an explicitly supplied date', async () => {
        const args = { collection, context: {}, req: authenticatedRequest, operation: 'update' as const, originalDoc };
        expect(await populatePersonPublishedAt({ ...args, data: { role: 'Photographer' } })).toMatchObject({
            publishedAt: originalDoc.publishedAt,
        });
        expect(
            await populatePersonPublishedAt({ ...args, data: { publishedAt: '2025-01-01T10:00:00.000Z' } }),
        ).toMatchObject({ publishedAt: '2025-01-01T10:00:00.000Z' });
        expect(await populatePersonPublishedAt({ ...args, data: { publishStatus: 'draft' } })).toEqual({
            publishStatus: 'draft',
        });
    });
});
