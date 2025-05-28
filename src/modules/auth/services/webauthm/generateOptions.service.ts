import { CoreService } from '@core';
import { getUser, hasUser, userStore } from '../../store/user';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

import { rpID } from '../consts';

export const generateOptions = new CoreService(
    {
        post: '/api/auth/generate-options',
    },
    async (request) => {
        const { username } = request.params;

        let allowCredentials: any[] = [];

        if (username && hasUser(username)) {
            const user = getUser(username);
            if (user)
                allowCredentials = user.credentials.map((cred) => ({
                    id: cred.credentialID,
                    type: 'public-key',
                    transports: cred.transports,
                }));
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: 'required',
        });

        if (username) request.session.username = username;
        request.session.challenge = options.challenge;

        setTimeout(() => {
            request.session.username = undefined;
            request.session.challenge = undefined;
        }, options.timeout);

        return options;
    },
);
