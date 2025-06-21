import { DataSource } from 'typeorm';
import { GenericRepository } from './generic';

import { User, UsersFindDto } from './Users';
import { MediaItem, MediaItemFindDto } from './MediaItems';
import { MediaSource, MediaSourceFindDto } from './MediaSources';
import { MediaItemTag, MediaItemTagFindDto } from './MediaItemTags';
import { MediaAlbum, MediaAlbumFindDto } from './MediaAlbums';
import { MediaAlbumItem, MediaAlbumItemFindDto } from './MediaAlbumItems';

export const Repositories: {
    Users: GenericRepository<User, UsersFindDto>;
    MediaSources: GenericRepository<MediaSource, MediaSourceFindDto>;
    MediaItems: GenericRepository<MediaItem, MediaItemFindDto>;
    MediaItemTags: GenericRepository<MediaItemTag, MediaItemTagFindDto>;
    MediaAlbums: GenericRepository<MediaAlbum, MediaAlbumFindDto>;
    MediaAlbumItems: GenericRepository<MediaAlbumItem, MediaAlbumItemFindDto>;
} = {} as any;

/**
 * TYPEORM REPOSITORIES INITIALIZATION
 * @param AppDataSource DataSource
 */
export function AppDataSourceInit(dataSource: DataSource) {
    Repositories.Users = new GenericRepository<User, UsersFindDto>(dataSource, User);
    Repositories.MediaSources = new GenericRepository<MediaSource, MediaSourceFindDto>(dataSource, MediaSource);
    Repositories.MediaItems = new GenericRepository<MediaItem, MediaItemFindDto>(dataSource, MediaItem);
    Repositories.MediaItemTags = new GenericRepository<MediaItemTag, MediaItemTagFindDto>(dataSource, MediaItemTag);
    Repositories.MediaAlbums = new GenericRepository<MediaAlbum, MediaAlbumFindDto>(dataSource, MediaAlbum);
    Repositories.MediaAlbumItems = new GenericRepository<MediaAlbumItem, MediaAlbumItemFindDto>(
        dataSource,
        MediaAlbumItem,
    );
}
