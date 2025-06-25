import { CoreService, UnauthorizedResponseError } from '@core';

export const getProfile = new CoreService(
    {
        get: '/api/auth/profile'
    },
    async (request) => {
        if (request.auth !== undefined) {
            return request.auth;
        } else throw UnauthorizedResponseError();
    },
);
