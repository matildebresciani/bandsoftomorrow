import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Payload } from 'payload';
import { findExistingId } from './find-existing';

export const seedMedia = async (payload: Payload) => {
    const imagePath = fileURLToPath(new URL('../../../public/images/__mocks__/placeholder.jpg', import.meta.url));
    const fileName = path.basename(imagePath);
    const existingId = await findExistingId(payload, 'media', 'filename', fileName);
    if (existingId) return existingId;

    if (!fs.existsSync(imagePath)) {
        throw new Error(`Seed image not found at ${imagePath}`);
    }

    const fileBuffer = fs.readFileSync(imagePath);

    const media = await payload.create({
        collection: 'media',
        data: {
            alt: 'Placeholder Image',
        },
        file: {
            data: fileBuffer,
            mimetype: 'image/jpeg',
            name: fileName,
            size: fileBuffer.length,
        },
        context: { disableRevalidate: true },
    });

    payload.logger.info(`✓ Seeded media: ${media.filename} (ID: ${media.id})`);
    return media.id;
};
