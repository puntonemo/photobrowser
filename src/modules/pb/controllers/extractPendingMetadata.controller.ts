import { Repositories } from 'model';
import { IsNull, Timestamp } from 'typeorm';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { getLocationDetailsFromExif } from '../helpers';

export async function extractPendingMetadata() {
    // __dirname en ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const __resolved = path.resolve(__dirname, '..');

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

        const output = spawnSync(path.join(__resolved, 'run-docker-exiftool.sh'), [mediaItem.path, mediaItem.root], {
            encoding: 'utf8',
        });

        if (output.error) {
            throw output.error;
        }

        if (output.status !== 0) {
            console.error('Error en la ejecución del script:', output.stderr);
            process.exit(output.status ?? 1);
        }

        const metadata = JSON.parse(output.stdout)[0];

        const timeStamp = new Date();

        const update: Record<string, any> = {
            metadata,
            metadataTs: timeStamp,
        };

        console.log('metadata.GPSLatitude', metadata.GPSLatitude);
        console.log('metadata.GPSLongitude', metadata.GPSLongitude);
        console.log('metadata.GPSLatitudeRef', metadata.GPSLatitudeRef);
        console.log('metadata.GPSLongitudeRef', metadata.GPSLongitudeRef);

        try{

            const location = await getLocationDetailsFromExif(metadata);
            
            if (location) {
                update.locationLabel = location.label;
                update.locationCountryName = location.countryName;
                update.locationState = location.state;
                update.locationCounty = location.county;
                update.locationCity = location.city;
                update.locationDistrict = location.district;
                update.locationStreet = location.street;
                update.locationHouseNumber = location.houseNumber;
                update.locationPostalCode = location.postalCode;
                update.locationLatitude = location.latitude;
                update.locationLongitude = location.longitude;
                update.locationTs = timeStamp;
            }
            
            if (location?.categories) {
                for (const category of location.categories) {
                    console.log(category);
                    const newTag = {
                        mediaItemId: mediaItem.id,
                        tag: category,
                        tagType: 'location',
                    };
                    await Repositories.MediaItemTags.create(newTag);
                }
            }
            
            update.locationTs = timeStamp;
        } catch {
            console.log('Error getting location');
        }

        await Repositories.MediaItems.repository.update({ id: mediaItem.id }, update);
    }
}
