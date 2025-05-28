import { encrypt } from '@lib/utils';

type State = {
    data?: string;
    redirect_uri?: string;
    deviceId?: string;
    sessionId?: string;
    expires_on?: number;
};
type GoogleDataQueryString = {
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    response_type?: string;
    access_type?: string;
    prompt?: string;
    state?: string;
};
type TwitterDataQueryString = {
    response_type?: string;
    client_id?: string;
    redirect_uri?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    scope?: string;
};
type LiveDataQueryString = {
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    response_type?: string;
    access_type?: string;
    prompt?: string;
    state?: string;
};
type StandarizedUserProfile = {
    id: string;
    firstname: string;
    lastname: string;
    displayName: string;
    email?: string;
    username: string;
    picture: string | null;
    provider?: string;
};
export const getProviderAuthUrl = (
    provider: string,
    redirect_uri: string,
    stateString?: string,
    scopes?: string,
    sessionId?: string,
    deviceId?: string,
    redirectUriBase?: string,
) => {
    var state: State;

    redirect_uri = !redirect_uri ? `${redirectUriBase}/` : `${redirectUriBase}${redirect_uri}`;

    if (!stateString) stateString = '{}';
    try {
        stateString = decodeURIComponent(stateString);
        state = JSON.parse(stateString);
        if (typeof state !== 'object') state = { data: state };
    } catch {
        state = {
            data: decodeURIComponent(stateString),
        };
    }
    state.redirect_uri = redirect_uri;

    if (sessionId) state.sessionId = sessionId;
    if (deviceId) state.deviceId = deviceId;

    switch (provider.toLowerCase()) {
        case 'google':
            if (!redirect_uri) return null;
            if (!scopes) scopes = process.env.GOOGLE_DEFAULT_SCOPES || '';
            //https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_2
            var googleData: GoogleDataQueryString = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                scope: scopes,
                response_type: process.env.GOOGLE_RESPONSE_TYPE,
                access_type: process.env.GOOGLE_ACCESS_TYPE,
                prompt: process.env.GOOGLE_PROMPT,
                state: encrypt(JSON.stringify(state)),
            };
            const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(googleData).toString()}`;
            return googleLoginUrl;

        case 'twitter':
            if (!redirect_uri) return null;
            if (!scopes) scopes = process.env.TWITTER_DEFAULT_SCOPES || '';
            //https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_2
            var twitterData: TwitterDataQueryString = {
                response_type: process.env.TWITTER_RESPONSE_TYPE,
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                state: encrypt(JSON.stringify(state)),
                code_challenge: process.env.TWITTER_CODE_CHALLENGE,
                code_challenge_method: process.env.TWITTER_CODE_CHALLENGE_METHOD,
                scope: scopes,
            };

            const twitterLoginUrl = `https://twitter.com/i/oauth2/authorize?${new URLSearchParams(twitterData).toString()}`;
            return twitterLoginUrl;

        case 'live':
            if (!redirect_uri) return null;
            if (!scopes) scopes = process.env.LIVE_DEFAULT_SCOPES || '';
            var liveData: LiveDataQueryString = {
                client_id: process.env.LIVE_CLIENT_ID,
                redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                scope: scopes,
                response_type: process.env.LIVE_RESPONSE_TYPE,
                access_type: process.env.LIVE_ACCESS_TYPE,
                prompt: process.env.LIVE_PROMPT,
                state: encrypt(JSON.stringify(state)),
            };
            const liveLoginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams(liveData).toString()}`;
            return liveLoginUrl;

        /*
            https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?
            client_id=6731de76-14a6-49ae-97bc-6eba6914391e
            &response_type=code
            &redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
            &response_mode=query
            &scope=openid%20offline_access%20https%3A%2F%2Fads.microsoft.com%2Fmsads.manage
            &state=12345
            */

        case 'certproxy':
            var certProxyData = {
                state: encrypt(JSON.stringify(state)) ?? '',
            };

            const redirectCertProxyProvider = process.env.REDIRECT_CERT_PROXY_PROVIDER;

            return redirectCertProxyProvider?.indexOf('?') === -1
                ? `${redirectCertProxyProvider}?${new URLSearchParams(certProxyData).toString()}`
                : `${redirectCertProxyProvider}&${new URLSearchParams(certProxyData).toString()}`;

        default:
            return null;
    }
};
