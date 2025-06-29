import { DataSource } from 'typeorm';
import { GenericRepository, QBGenericRepository } from './_gen';
import * as entities from './entities';
import { User, UsersFindDto, UsersRepositoryOptions } from './Users';
import { UserCredential, UserCredentialsFindDto } from './UserCredentials';
import { MediaItem, MediaItemFindDto, MediaItemsOptions } from './MediaItems';
import { MediaSource, MediaSourceFindDto } from './MediaSources';
import { MediaItemTag, MediaItemTagFindDto } from './MediaItemTags';
import { MediaAlbum, MediaAlbumFindDto, MediaAlbumOptions } from './MediaAlbums';

export const Repositories: {
    Users: GenericRepository<User, UsersFindDto>;
    UserCredentials: GenericRepository<UserCredential, UserCredentialsFindDto>;
    MediaSources: GenericRepository<MediaSource, MediaSourceFindDto>;
    MediaItems: QBGenericRepository<MediaItem, MediaItemFindDto>;
    MediaItemTags: GenericRepository<MediaItemTag, MediaItemTagFindDto>;
    MediaAlbums: QBGenericRepository<MediaAlbum, MediaAlbumFindDto>;
} = {} as any;

/**
 * TYPEORM REPOSITORIES INITIALIZATION
 * @param AppDataSource DataSource
 */
function RepositoriesInit(dataSource: DataSource) {
    Repositories.Users = new GenericRepository<User, UsersFindDto>(dataSource, User, UsersRepositoryOptions);
    Repositories.UserCredentials = new GenericRepository<UserCredential, UserCredentialsFindDto>(
        dataSource,
        UserCredential,
    );
    Repositories.MediaSources = new GenericRepository<MediaSource, MediaSourceFindDto>(dataSource, MediaSource);
    Repositories.MediaItems = new QBGenericRepository<MediaItem, MediaItemFindDto>(dataSource, MediaItem, MediaItemsOptions);
    Repositories.MediaItemTags = new GenericRepository<MediaItemTag, MediaItemTagFindDto>(dataSource, MediaItemTag);
    Repositories.MediaAlbums = new QBGenericRepository<MediaAlbum, MediaAlbumFindDto>(
        dataSource,
        MediaAlbum,
        MediaAlbumOptions,
    );
}

export type AppDataSourceInitOptionsType = {
    type: 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'mssql' | 'sap' | 'oracle' | 'mongodb' | 'spanner';
    hostname: string;
    port: number;
    username: string;
    password: string;
    database: string;
    dbLogging: boolean;
};
export function AppDataSourceInit(options: AppDataSourceInitOptionsType): Promise<DataSource> {
    const { type, hostname, port, username, password, database, dbLogging } = options;
    return new Promise((resolve, reject) => {
        console.debug(`AppDataSourceInit: ${type}://${username}:${password}@${hostname}:${port}/${database}`);
        const AppDataSource = new DataSource({
            type,
            host: hostname,
            port: port,
            username: username,
            password: password,
            database: database,
            synchronize: false,
            logging: dbLogging,
            entities: entities,
        });
        AppDataSource.initialize()
            .then((dataSource) => {
                RepositoriesInit(dataSource);
                resolve(dataSource);
            })
            .catch(reject);
    });
}
