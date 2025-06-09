import { Repositories } from 'model';
import { IsNull } from 'typeorm';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

export async function extractPendingMetadata() {
    // __dirname en ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const __resolved = path.resolve(__dirname);

    console.log('__filename', __filename);
    console.log('__dirname', __dirname);
    console.log('__resolved', __resolved);

    const mediaItems = await Repositories.MediaItems.repository.find({
        where: {
            metadataTs: IsNull(),
        },
    });

    if (!mediaItems || mediaItems.length == 0) return;

    for (const mediaItem of mediaItems) {
        console.log('Extractions info of', mediaItem.root, mediaItem.path);
        // const output = execFileSync('sudo', [
        //     '/home/dpascual/code/photobrowser-poc/run-docker-exiftool.sh',
        //     `'${mediaItem.path}'`,
        //     `'${mediaItem.root}'`,
        // ]);

        const output = spawnSync(
            '/home/dpascual/code/photobrowser-poc/run-docker-exiftool.sh',
            [mediaItem.path, mediaItem.root],
            {
                encoding: 'utf8',
            },
        );

        if (output.error) {
            throw output.error;
        }

        if (output.status !== 0) {
            console.error('Error en la ejecución del script:', output.stderr);
            process.exit(output.status ?? 1);
        }

        const metadata = JSON.parse(output.stdout)[0];
        console.log(metadata);

        await Repositories.MediaItems.repository.update({ id: mediaItem.id }, { metadata, metadataTs: new Date() });
    }
}
