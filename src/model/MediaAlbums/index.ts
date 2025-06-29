import { GenericRepositoryOptions } from 'model/_gen/repository';

export * from './entity';
export * from './findDto';

export const MediaAlbumOptions: GenericRepositoryOptions = {
    relations: [{ mediaItems: { mediaItem: true } }, 'mediaAlbums'],
    filters: ['id'],
};
