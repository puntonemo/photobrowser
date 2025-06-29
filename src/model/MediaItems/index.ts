import { GenericRepositoryOptions } from 'model/_gen';

export * from './entity';
export * from './findDto';

export const MediaItemsOptions: GenericRepositoryOptions = {
    relations: ['mediaAlbums'],
    filters: ['id', 'mediaAlbums.mediaAlbumId'],
};
