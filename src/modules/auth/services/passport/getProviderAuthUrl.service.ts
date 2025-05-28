import { CoreService, CoreRequest, responseError, HttpStatusCode } from '@core';
import * as logic from '../../controllers/passport/getProviderAuthUrl.controller';

export const getProviderAuthUrl = new CoreService(
    {
        get: '/api/auth/passport/authUrl/:provider',
    },
    async (request: CoreRequest) => {
        const { provider, redirect_uri, state, scopes } = request.params;
        const sessionId = request.session.id;
        if (sessionId != null) {
            request.session['remoteAddess'] = request.remoteAddress;
            request.session['userAgent'] = request.headers['user-agent'];
        }

        const deviceId = request.session._deviceInfo?.id;

        const redirectUriBase = request.headers.referer
            ? new URL(request.headers.referer).origin
            : (process.env.REDIRECT_URI_BASE ?? ``);

        const authUrl = logic.getProviderAuthUrl(
            provider,
            redirect_uri,
            state,
            scopes,
            sessionId,
            deviceId?.toString(),
            redirectUriBase,
        );
        ///api/passport/authUrl/google?state={}&redirect_uri=/home
        ///api/passport/authUrl/live?state={}&redirect_uri=/home
        ///api/passport/authUrl/twitter?state={}&redirect_uri=/home
        ///api/passport/response/google
        if (authUrl != null) {
            //Some devices, like old iPhones are not sending the sec-fetch-mode, so invert the next condition
            //if(request.origin == 'ws' || (request.origin == 'http' && request.headers['sec-fetch-mode'] != 'navigate')){
            if (request.origin == 'http' && request.headers['sec-fetch-mode'] == 'cors') {
                const response = {
                    provider,
                    authUrl: authUrl,
                };
                return response;
            } else {
                request.redirect(authUrl);
                return {};
            }
        } else {
            return responseError(HttpStatusCode.InternalServerError);
        }
    },
);
