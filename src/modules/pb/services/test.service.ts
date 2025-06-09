import { CoreService } from '@core';
import * as controllers from '../controllers';

export const test = new CoreService(
    {
        get: '/api/pb/test',
    },
    async () => {
        return { result: 'success '}
    },
);

export const metadata = new CoreService(
    {
        get: '/api/pb/metadata',
    },
    async () => {
        controllers.extractPendingMetadata();
        return { result: 'success '}
    },
);