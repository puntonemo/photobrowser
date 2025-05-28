import { CoreService } from '@core';

export const test = new CoreService(
    {
        get: '/api/pb/test',
    },
    async () => {
        return { result: 'success '}
    },
);
