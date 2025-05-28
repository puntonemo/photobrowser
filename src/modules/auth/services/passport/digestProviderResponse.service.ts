import { CoreService, CoreRequest, responseError, HttpStatusCode } from '@core';
import * as logic from '../../controllers/passport/digestProviderResponse.controller';
import { addOrUpdateUser, getUser, hasUser } from '@modules/auth/store/user';

export const digestProviderResponse = new CoreService(
    {
        get: '/api/auth/passport/response/:provider',
    },
    async (request: CoreRequest) => {
        const providerResponse = await logic.digestProviderResponse(request.params).catch((error) => {
            return responseError(500, error);
        });

        request.session.passportAuthProviderResponse = providerResponse;

        if (hasUser(providerResponse.profile.email)) {
            const user = getUser(providerResponse.profile.email);
            request.session.auth = { username: user?.username, displayName: user?.displayName };
        } else {
            const user = {
                id: providerResponse.profile.email,
                username: providerResponse.profile.email,
                displayName: providerResponse.profile.displayName,
                credentials: [],
            };

            addOrUpdateUser(user);
            request.session.auth = {
                username: providerResponse.profile.email,
                displayName: providerResponse.profile.displayName,
            };
        }

        if (request.origin == 'http' && request.headers['sec-fetch-mode'] == 'cors') {
            return providerResponse;
        } else {
            request.redirect(providerResponse.state.redirect_uri);
            return providerResponse;
        }
    },
);
