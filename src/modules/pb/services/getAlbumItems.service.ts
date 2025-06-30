import { CoreService, CoreRequest } from '@core';
import getAlbumItemsController from './getAlbumItems.controller';
import getAlbumItemsDTO from './getAlbumItems.dto';

export const getAlbumItems = new CoreService(
    {
        get: '/api/pb/albums/:id/items',
        meta: {
            DTO: getAlbumItemsDTO,
            schema: 'list',
            public: true,
        },
    },
    async (request: CoreRequest) => {
        const { id } = request.params;
        return getAlbumItemsController({ 'mediaAlbums.mediaAlbumId': id, mediaAlbums: true });
    },
);
