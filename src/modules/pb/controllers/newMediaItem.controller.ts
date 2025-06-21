import { Repositories } from 'model';
import { getFileSHA256 } from '../helpers';
import { imageExtensions } from '..';
import { MediaItem } from 'model/MediaItems';
import { join, relative, extname, basename } from 'path';
import { MediaAlbum } from 'model/MediaAlbums';

export function newMediaItem(base: string, path: string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const signature = await getFileSHA256(join(base, path));

            console.log('New file:', base, path, signature);

            let mediaItem = await Repositories.MediaItems.getOne({ signature });
            const mediaSource = await Repositories.MediaSources.getOne({ path: base });

            if (!mediaSource) {
                console.warn(`MediaSource ${base} not found`);
                return;
            }

            const user = await Repositories.Users.getOne({ id: mediaSource.userId });

            if (!user) {
                console.warn(`User ${mediaSource.userId} not found`);
                return;
            }

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

                mediaItem = await Repositories.MediaItems.create(newMediaItem);

                await Repositories.MediaAlbumItems.create({
                    mediaAlbumId: mediaSource.mediaAlbumId,
                    mediaItemId: mediaItem.id,
                    createdAt: new Date(),
                    createdBy: user.id,
                });
            } else {
                console.log(`Media Item ${signature} already existing`);
                const mediaAlbumItems = await Repositories.MediaAlbumItems.getOne({
                    mediaAlbumId: mediaSource.mediaAlbumId,
                    mediaItemId: mediaItem.id,
                });
                if (!mediaAlbumItems) {
                    await Repositories.MediaAlbumItems.create({
                        mediaAlbumId: mediaSource.mediaAlbumId,
                        mediaItemId: mediaItem.id,
                        createdAt: new Date(),
                        createdBy: user.id,
                    });
                }
            }
            resolve();
        }, 2000);
    });
}
