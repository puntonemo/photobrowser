import { CoreService } from '@core';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpID } from '../consts';
import { Repositories } from 'model';

export const generateOptions = new CoreService(
    {
        post: '/api/auth/generate-options',
    },
    async (request) => {
        const { username } = request.params;

        let allowCredentials: any[] = [];

        let user = await Repositories.Users.getOne({ username, credentials: true });

        if (user && user.credentials)
            allowCredentials = user.credentials.map((cred) => ({
                id: cred.credentialId,
                type: 'public-key',
                transports: cred.transports,
            }));

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
