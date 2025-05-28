import { CoreService } from '@core';
import { addOrUpdateUser, hasUser } from '../store/user';
import { BadRequestResponseError } from 'core/engine/responseError';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { sendPinCode } from '../helpers';

export const signup = new CoreService(
    {
        post: '/api/auth/signup',
    },
    async (request) => {
        const { firstname, lastname, email, challenge, pinCode, language } = request.params;

        if (!firstname || !lastname || !email) return BadRequestResponseError();

        const signupChallenge = isoBase64URL.fromUTF8String(email);
        const displayName = `${firstname} ${lastname}`;

        // if (hasUser(email)) return { challenge: signupChallenge };

        if (!challenge) {
            const pinCode = (Math.floor(Math.random() * 899999) + 100000).toString();

            request.session.pinCode = pinCode;
            request.session.challenge = signupChallenge;

            sendPinCode(email, displayName, pinCode, language);

            return { challenge: signupChallenge };
        } else {
            if (!pinCode) return BadRequestResponseError();

            if (pinCode !== request.session.pinCode || challenge !== request.session.challenge) {
                request.session.challenge = signupChallenge;
                return { challenge: signupChallenge };
            }

            request.session.pinCode = undefined;
            request.session.challenge = undefined;

            if (hasUser(email)) return BadRequestResponseError('alreadyExisting');

            const user = {
                id: email,
                username: email,
                displayName,
                credentials: [],
            };

            addOrUpdateUser(user);
            return { result: 'succcess' };
        }
    },
);
