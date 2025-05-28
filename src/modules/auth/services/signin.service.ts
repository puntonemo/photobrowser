import { CoreService } from '@core';
import { getUser } from '../store/user';
import { BadRequestResponseError } from 'core/engine/responseError';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { sendPinCode } from '../helpers';

export const signin = new CoreService(
    {
        post: '/api/auth/signin',
    },
    async (request) => {
        const { email, challenge, pinCode, language } = request.params;

        if (!email) return BadRequestResponseError();

        const user = getUser(email);

        const signinChallenge = isoBase64URL.fromUTF8String(email);

        if (!user) return { challenge: signinChallenge };

        if (!challenge) {
            const pinCode = (Math.floor(Math.random() * 899999) + 100000).toString();

            request.session.pinCode = pinCode;
            request.session.challenge = signinChallenge;

            sendPinCode(email, user.displayName, pinCode, language);

            return { challenge: signinChallenge };
        } else {
            if (!pinCode) return BadRequestResponseError();

            if (pinCode !== request.session.pinCode || challenge !== request.session.challenge) {
                request.session.challenge = signinChallenge;
                return { challenge: signinChallenge };
            }

            request.session.pinCode = undefined;
            request.session.challenge = undefined;
            request.session.auth = { username: email, displayName: user?.displayName };

            return { result: 'success' };
        }
    },
);
