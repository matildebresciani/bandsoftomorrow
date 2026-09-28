import assert from 'node:assert/strict';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { People } from '@/collections/team/people/config';
import { isFrontendRoutedCollection, isRoutedCollection } from '@/i18n/localized-collections';
import { payloadLinkInner } from '@/lib/field-templates/links';
import { formatLinkByCollection } from '@/lib/utilities/format-link';
import { createRoutedCollection } from './routed-collection';

describe('routed collection defaults', () => {
    it.each(['pages', 'posts'] as const)('preserves %s fields and preview support', (slug) => {
        const config = createRoutedCollection(slug, { fields: [] });
        expect(config.fields.flatMap((field) => ('name' in field ? [field.name] : []))).toEqual([
            'name',
            'title',
            'publishedAt',
            'publishStatus',
            'slug',
            'slugLock',
            'contentMeta',
        ]);
        const status = config.fields.find((field) => 'name' in field && field.name === 'publishStatus');
        assert(status?.type === 'select');
        expect(status.options).toContainEqual({ label: 'Waiting for Approval', value: 'pendingApproval' });
        expect(config.admin?.preview).toBeTypeOf('function');
        expect(config.admin?.livePreview?.url).toBeTypeOf('function');
        expect(config.versions).toEqual({ maxPerDoc: 50 });
    });

    it('keeps People focused on person fields without mutating defaults', () => {
        expect(People.fields.flatMap((field) => ('name' in field ? [field.name] : []))).toEqual([
            'name',
            'role',
            'email',
            'profilePicture',
            'description',
            'publishedAt',
            'publishStatus',
            'slug',
            'slugLock',
        ]);
        const status = People.fields.find((field) => 'name' in field && field.name === 'publishStatus');
        assert(status?.type === 'select');
        expect(status.options).toEqual([
            { label: 'Draft', value: 'draft' },
            { label: 'Public', value: 'public' },
        ]);
        expect(People.fields).toContainEqual(expect.objectContaining({ name: 'name', required: true }));
        expect(People.fields).toContainEqual(expect.objectContaining({ name: 'role', localized: true }));
        expect(People.fields).toContainEqual(
            expect.objectContaining({ name: 'description', type: 'richText', localized: true }),
        );
        expect(People.versions).toEqual({ maxPerDoc: 50 });
    });
});

describe('future People routes', () => {
    it('reserves localized profile URLs without enabling frontend discovery', () => {
        expect(isRoutedCollection('people')).toBe(true);
        expect(isFrontendRoutedCollection('people')).toBe(false);
        expect(formatLinkByCollection('alex', 'people', 'da')).toBe('/personer/alex');
        expect(formatLinkByCollection('alex', 'people', 'en')).toBe('/en/people/alex');
        expect(People.admin?.preview).toBeUndefined();
        expect(People.admin?.livePreview).toBeUndefined();

        const sitemaps = robots().sitemap;
        assert(Array.isArray(sitemaps));
        expect(sitemaps.some((url) => url.includes('/sitemaps/people/'))).toBe(false);
        expect(sitemaps.some((url) => url.includes('/sitemaps/posts/'))).toBe(true);
    });

    it('only offers implemented pages in the shared link selector', () => {
        const row = payloadLinkInner().fields.find((field) => field.type === 'row');
        assert(row?.type === 'row');
        const relationship = row.fields.find((field) => field.type === 'relationship');
        assert(relationship?.type === 'relationship');
        expect(relationship.relationTo).toEqual(['pages', 'posts']);
    });
});
