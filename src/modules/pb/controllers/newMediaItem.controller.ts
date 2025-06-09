import { Repositories } from 'model';
import { getFileSHA256 } from '../helpers';
import { imageExtensions } from '..';
import { MediaItem } from 'model/MediaItems';
import { join, relative, extname, basename } from 'path';

export function newMediaItem(base: string, path: string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const signature = await getFileSHA256(join(base, path));

            console.log('Archivo nuevo:', base, path, signature);
            
            let mediaItem = await Repositories.MediaItems.getOne({ signature });
            const mediaSource = await Repositories.MediaSources.getOne({ path: base });
            if (!mediaSource) return;
            
            if (!mediaItem) {
                const type = imageExtensions.includes(extname(path).slice(1)) ? 'photo' : 'video';
                const itemBasename = basename(path).replace(`${extname(path)}`, '');
                const newMediaItem: Partial<MediaItem> = {
                    userId: mediaSource.userId,
                    mediaSourceId: mediaSource.id,
                    root: mediaSource.path,
                    path: path,
                    basename: itemBasename,
                    type,
                    signature,
                };

                await Repositories.MediaItems.create(newMediaItem);
            } else {
                console.log(`Media Item ${signature} already existing`);
            }
            resolve();
        }, 2000);
    });
}
