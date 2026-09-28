import assert from 'node:assert/strict';
import { describe, expect, it } from 'vitest';
import { groupTagOptions, mergeTags, selectedTagOptions } from './options';

const groups = [
    { id: 'genre', name: 'Genre', tagGroup: 'Genrer', collectionsOnTagGroup: ['posts'] },
    { id: 'artist', name: 'Artist', tagGroup: 'Artister', collectionsOnTagGroup: ['posts'] },
    { id: 'unused', name: 'Unused', collectionsOnTagGroup: [] },
    { id: 'type', name: 'Article type', tagGroup: ' ', collectionsOnTagGroup: ['posts'] },
];
const tags = [
    { id: 'rock', name: 'Rock', tag: 'Rock', tagGroup: 'genre' },
    { id: 'pop', name: 'Pop', tag: 'Pop', tagGroup: 'genre' },
    { id: 'band', name: 'Band named Pop', tag: 'Pop', tagGroup: groups[1] },
    { id: 'interview', name: 'Interview', tag: '', tagGroup: 'type' },
    { id: 'legacy', name: 'Legacy tag', tagGroup: 'unused' },
];

describe('grouped tag choices', () => {
    it('sorts localized headings and labels, with internal-name fallback and separate duplicate labels', () => {
        expect(groupTagOptions(groups, tags, 'da')).toEqual([
            { label: 'Article type', options: [{ label: 'Interview', value: 'interview' }] },
            { label: 'Artister', options: [{ label: 'Pop', value: 'band' }] },
            {
                label: 'Genrer',
                options: [
                    { label: 'Pop', value: 'pop' },
                    { label: 'Rock', value: 'rock' },
                ],
            },
        ]);
    });

    it('uses the requested locale for alphabetic ordering', () => {
        const localeTags = [
            { id: 'a', name: 'Å', tagGroup: 'genre' },
            { id: 'z', name: 'Z', tagGroup: 'genre' },
        ];
        expect(groupTagOptions(groups, localeTags, 'en')[0]?.options.map((tag) => tag.value)).toEqual(['a', 'z']);
        expect(groupTagOptions(groups, localeTags, 'da')[0]?.options.map((tag) => tag.value)).toEqual(['z', 'a']);
    });

    it('retains selected IDs, order, unavailable records and tags in ineligible groups', () => {
        expect(selectedTagOptions(['legacy', 'gone', 'rock'], tags, 'Unavailable')).toEqual([
            { value: 'legacy', label: 'Legacy tag' },
            { value: 'gone', label: 'Unavailable (gone)' },
            { value: 'rock', label: 'Rock' },
        ]);
        expect(selectedTagOptions(['rock'], [], 'Unavailable')).toEqual([
            { value: 'rock', label: 'Unavailable (rock)' },
        ]);
    });

    it('deduplicates overlapping pages by ID while accepting edited labels', () => {
        assert(tags[0]);
        expect(mergeTags(tags, [{ ...tags[0], tag: 'Updated rock' }])).toHaveLength(tags.length);
        expect(mergeTags(tags, [{ ...tags[0], tag: 'Updated rock' }])[0]?.tag).toBe('Updated rock');
    });
});
