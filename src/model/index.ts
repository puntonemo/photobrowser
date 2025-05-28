import { DataSource } from "typeorm";
import { GenericRepository } from "./generic";

import { User, UsersFindDto } from "./Users";
import { MediaItem, MediaItemFindDto } from "./MediaItems";
import { MediaSource, MediaSourceFindDto } from "./MediaSources";

export const Repositories: {
    Users: GenericRepository<User, UsersFindDto>
    MediaSources: GenericRepository<MediaSource, MediaSourceFindDto>
    MediaItems: GenericRepository<MediaItem, MediaItemFindDto>
} = {} as any;

/**
 * TYPEORM REPOSITORIES INITIALIZATION
 * @param AppDataSource DataSource
 */
export function AppDataSourceInit(dataSource: DataSource) {
    Repositories.Users = new GenericRepository<User, UsersFindDto>(dataSource, User);
    Repositories.MediaSources = new GenericRepository<MediaSource, MediaSourceFindDto>(dataSource, MediaSource);
    Repositories.MediaItems = new GenericRepository<MediaItem, MediaItemFindDto>(dataSource, MediaItem);
}