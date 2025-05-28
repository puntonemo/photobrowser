import { CoreService } from '@core';
import { getUser } from '../../store/user';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import type { WebAuthnCredential } from '@simplewebauthn/server';
import { rpID, origin } from '../consts';

const toBase64Url = (input: Buffer | string): string =>
    Buffer.isBuffer(input) ? input.toString('base64url') : Buffer.from(input).toString('base64url');

const fromBase64Url = (input: string) => Buffer.from(input, 'base64url').toString();

export const verifyAuthentication = new CoreService(
    {
        post: '/api/auth/verify',
    },
    async (request) => {
        const response = request.params as AuthenticationResponseJSON;
        const username = response.response.userHandle ? fromBase64Url(response.response.userHandle) : '';
        const expectedChallenge = request.session.challenge;
        const user = getUser(username);
        const dbCred = user?.credentials.find((cred) => cred.credentialID === response.rawId);

        if (!expectedChallenge || !dbCred) {
            return { verified: false };
        }

        const credential: WebAuthnCredential = {
            id: toBase64Url(dbCred.credentialID),
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
            request.session.auth = { username, displayName: user?.displayName };
        } else {
            request.session.auth = undefined;
        }
        return { verified: verification.verified };
    },
);
