import { z } from 'zod';

export const pageNumberSchema = z.undefined().or(z.coerce.number().int());

/** Archive pagination accepts positive, safe integers in canonical decimal form. */
export const archivePageNumberSchema = z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .transform((value) => value ?? 1);
