import { CoreService } from '@core';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import type { WebAuthnCredential } from '@simplewebauthn/server';
import { rpID, origin } from '../consts';
import { Repositories } from 'model';

const toBase64Url = (input: Buffer | string): string =>
    Buffer.isBuffer(input) ? input.toString('base64url') : Buffer.from(input).toString('base64url');

const fromBase64Url = (input: string) => Buffer.from(input, 'base64url').toString();

export const verifyAuthentication = new CoreService(
    {
        post: '/api/auth/verify',
        meta: {
            public: true,
        },
    },
    async (request) => {
        const response = request.params as AuthenticationResponseJSON;
        const username = response.response.userHandle ? fromBase64Url(response.response.userHandle) : '';
        const expectedChallenge = request.session.challenge;
        let user = await Repositories.Users.getOne({ username });
        const dbCred = user?.credentials.find((cred) => cred.credentialId === response.rawId);

        if (!expectedChallenge || !dbCred) {
            return { verified: false };
        }

        const credential: WebAuthnCredential = {
            id: toBase64Url(dbCred.credentialId),
            publicKey: Buffer.isBuffer(dbCred.publicKey) ? dbCred.publicKey : Buffer.from(dbCred.publicKey, 'base64'),
            counter: dbCred.counter,
            transports: dbCred.transports,
        };

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential,
        });

        request.session.username = undefined;
        request.session.challenge = undefined;

        request.session.challenge = undefined;

        if (verification.verified) {
            request.session.auth = { ...user };
        } else {
            request.session.auth = undefined;
        }
        return { verified: verification.verified };
    },
);
