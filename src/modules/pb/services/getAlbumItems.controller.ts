import { Repositories } from 'model';
import { MediaAlbumFindDto } from 'model/MediaAlbums';
import { GenericFindDto } from 'model/_gen/repository';

export default async (filters: Partial<MediaAlbumFindDto & GenericFindDto>) => {
    return Repositories.MediaAlbums.find(filters);
};
