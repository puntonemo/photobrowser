import { CoreService } from '@core';
import getUserAlbumsController from './getUserAlbums.controller';

export const getUserAlbums = new CoreService(
    {
        get: '/api/pb/albums',
        meta: {
            public: true,
        },
    },
    async () => {
        return getUserAlbumsController();
    },
);
