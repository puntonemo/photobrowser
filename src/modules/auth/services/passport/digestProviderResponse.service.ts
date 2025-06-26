import { CoreService, CoreRequest, responseError, HttpStatusCode, BadRequestResponseError } from '@core';
import * as logic from '../../controllers/passport/digestProviderResponse.controller';
import { Repositories } from 'model';

export const digestProviderResponse = new CoreService(
    {
        get: '/api/auth/passport/response/:provider',
        meta: {
            public: true,
        },
    },
    async (request: CoreRequest) => {
        const providerResponse = await logic.digestProviderResponse(request.params).catch((error) => {
            return responseError(500, error);
        });

        request.session.passportAuthProviderResponse = providerResponse;

        if (providerResponse.profile.email) {
            let user = await Repositories.Users.getOne({ username: providerResponse.profile.email, relations: true });

            if (user) {
                request.session.auth = { username: user?.username, displayName: user?.displayname };
            } else {
                const newUser = {
                    username: providerResponse.profile.email,
                    firstname: providerResponse.profile.firstname,
                    lastname: providerResponse.profile.lastname,
                    credentials: [],
                };

                user = await Repositories.Users.create(newUser);

                request.session.auth = { ...user };
            }

            if (request.origin == 'http' && request.headers['sec-fetch-mode'] == 'cors') {
                return providerResponse;
            } else {
                request.redirect(providerResponse.state.redirect_uri);
                return providerResponse;
            }
        } else {
            throw BadRequestResponseError();
        }
    },
);
