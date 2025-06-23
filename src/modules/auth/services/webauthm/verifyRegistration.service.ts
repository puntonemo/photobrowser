import { CoreService } from '@core';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { Repositories } from 'model';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { rpID, origin } from '../consts';

const toBase64Url = (input: Buffer | string): string =>
    Buffer.isBuffer(input) ? input.toString('base64url') : Buffer.from(input).toString('base64url');

export const verifyRegistration = new CoreService(
    {
        post: '/api/auth/register/verify',
    },
    async (request) => {
        function extractChallenge(clientDataJSONBase64: string): string {
            const buffer = Buffer.from(clientDataJSONBase64, 'base64');
            const clientData = JSON.parse(buffer.toString('utf8'));
            return clientData.challenge;
        }
        const body = request.params as RegistrationResponseJSON;
        const expectedChallenge = body.response.clientDataJSON && extractChallenge(body.response.clientDataJSON);
        
        const username = request.session.username;
        if (!username) return { verified: false };

        let user = await Repositories.Users.getOne({ username });

        if (!user) return { verified: false };

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo && verification.registrationInfo.credential) {
            await Repositories.UserCredentials.create({
                userId: user.id,
                user: user,
                credentialId: verification.registrationInfo.credential.id,
                publicKey: verification.registrationInfo.credential.publicKey
                    ? Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64')
                    : '',
                counter: verification.registrationInfo.credential.counter,
                transports: verification.registrationInfo.credential.transports,
            });
        }

        request.session.username = undefined;
        request.session.challenge = undefined;

        if (verification.verified) {
            request.session.auth = { ...user };
        } else {
            request.session.auth = undefined;
        }

        return { verified: verification.verified };
    },
);
