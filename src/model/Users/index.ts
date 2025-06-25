import { GenericRepositoryOptions } from 'model/_gen/repository';

export * from './entity';
export * from './findDto';

export const UsersRepositoryOptions: GenericRepositoryOptions = {
    relations: ['credentials', { mediaAlbums: { mediaAlbum: true } }],
    filters: ['id', 'username'],
};
