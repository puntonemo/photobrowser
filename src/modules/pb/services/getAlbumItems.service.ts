import { CoreService, CoreRequest } from '@core';
import getAlbumItemsController from './getAlbumItems.controller';

export const getAlbumItems = new CoreService(
    {
        get: '/api/pb/albums/:id/items',
        meta: {
            schema: 'list',
            public: true,
        },
    },
    async (request: CoreRequest) => {
        const { id } = request.params;
        return getAlbumItemsController({ 'mediaAlbums.mediaAlbumId': id, mediaAlbums: true });
    },
);
