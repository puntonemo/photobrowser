import { CoreService, UnauthorizedResponseError } from '@core';
import { serviceRequestInterceptor, serviceRequestManager } from '../requestManagers';

export const getProfile = new CoreService(
    {
        get: '/api/auth/profile',
        requestManager: serviceRequestManager,
        interceptor: serviceRequestInterceptor
    },
    async (request) => {
        if (request.session.auth !== undefined) {
            return request.session.auth;
        } else throw UnauthorizedResponseError();
    },
);
