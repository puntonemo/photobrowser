import { CoreService } from '@core';
import * as controllers from '../controllers';

export const getUserAlbums = new CoreService(
    {
        get: '/api/pb/albums',
        meta: {
            public: true,
        },
    },
    async () => {
        return controllers.getUserAlbums();
    },
);
