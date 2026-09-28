import { z } from 'zod';

export const tagGroupOptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    tagGroup: z.string().nullable().optional(),
    collectionsOnTagGroup: z.array(z.string()).nullable().optional(),
});

export const tagOptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    tag: z.string().nullable().optional(),
    tagGroup: z.union([z.string(), tagGroupOptionSchema]).nullable().optional(),
});

export const tagGroupsPageSchema = z.object({
    docs: z.array(tagGroupOptionSchema),
    nextPage: z.number().nullable().optional(),
});

export const tagsPageSchema = z.object({
    docs: z.array(tagOptionSchema),
    nextPage: z.number().nullable().optional(),
});

export type TagGroupOption = z.infer<typeof tagGroupOptionSchema>;
export type TagOption = z.infer<typeof tagOptionSchema>;
