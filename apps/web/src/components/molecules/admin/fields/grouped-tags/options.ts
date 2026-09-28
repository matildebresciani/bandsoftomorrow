import type { TagGroupOption, TagOption } from '@/lib/schemas/tag-picker';

export type TagSelectOption = { label: string; value: string };
export type TagSelectGroup = { label: string; options: TagSelectOption[] };

export const getTagGroupId = (tag: TagOption) => (typeof tag.tagGroup === 'string' ? tag.tagGroup : tag.tagGroup?.id);

export const getTagLabel = (tag: TagOption) => tag.tag?.trim() || tag.name || tag.id;

/** Only dropdown candidates are filtered; saved relationship IDs remain independent. */
export const groupTagOptions = (groups: TagGroupOption[], tags: TagOption[], locale: string): TagSelectGroup[] => {
    const collator = new Intl.Collator(locale);
    return groups
        .filter((group) => group.collectionsOnTagGroup?.includes('posts'))
        .map((group) => ({
            label: group.tagGroup?.trim() || group.name || group.id,
            options: tags
                .filter((tag) => getTagGroupId(tag) === group.id)
                .map((tag) => ({ value: tag.id, label: getTagLabel(tag) }))
                .sort(
                    (left, right) => collator.compare(left.label, right.label) || left.value.localeCompare(right.value),
                ),
        }))
        .filter((group) => group.options.length > 0)
        .sort((left, right) => collator.compare(left.label, right.label));
};

/** Preserve saved IDs and their order even if a record is missing or cannot currently be read. */
export const selectedTagOptions = (ids: string[], tags: TagOption[], unavailableLabel: string): TagSelectOption[] => {
    const byId = new Map(tags.map((tag) => [tag.id, tag]));
    return ids.map((id) => {
        const tag = byId.get(id);
        return { value: id, label: tag ? getTagLabel(tag) : `${unavailableLabel} (${id})` };
    });
};

export const mergeTags = (current: TagOption[], incoming: TagOption[]): TagOption[] => [
    ...new Map([...current, ...incoming].map((tag) => [tag.id, tag])).values(),
];
