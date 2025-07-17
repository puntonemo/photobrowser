import { GenericRepositoryOptions } from 'model/_gen';

export * from './entity';
export * from './findDto';

export const UsersRepositoryOptions: GenericRepositoryOptions = {
    relations: ['credentials', { mediaAlbums: { mediaAlbum: true } }],
    filters: ['id', 'username'],
};
