import { CoreService, UnauthorizedResponseError } from '@core';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpID, rpName } from '../consts';
import { Repositories } from 'model';

export const registrationOptions = new CoreService(
    {
        post: '/api/auth/register/generate-options',
    },
    async (request) => {
        const { username } = request.params;
        const userID = Buffer.from(username, 'utf8');

        let user = await Repositories.Users.getOne({ username });

        // if (!hasUser(username)) {
        //     addOrUpdateUser({ id: username, username, displayName: 'Nombre de usuario', credentials: [] });
        // }

        if(!user) throw UnauthorizedResponseError();

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID,
            userName: username,
            userDisplayName: user.displayname,
            attestationType: 'none',
            authenticatorSelection: {
                userVerification: 'required',
                residentKey: 'preferred',
                requireResidentKey: false,
            },
        });

        request.session.username = username;
        request.session.challenge = options.challenge;

        setTimeout(() => {
            request.session.username = undefined;
            request.session.challenge = undefined;
        }, options.timeout);

        return options;
    },
);
