import { CoreService } from '@core';

export const getProfile = new CoreService(
    {
        get: '/api/auth/profile',
    },
    async (request) => {
        if (request.session.auth !== undefined) {
            return request.session.auth;
        } else throw { status: 'unauthohorized' };
    },
);
