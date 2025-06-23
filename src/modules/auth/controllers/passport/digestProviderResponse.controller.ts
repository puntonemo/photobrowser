import { encrypt, decrypt } from '@lib/utils';

type StandarizedUserProfile = {
    id: string;
    firstname: string;
    lastname: string;
    displayname: string;
    email?: string;
    username: string;
    picture: string | null;
    provider?: string;
};

const PASSPORT_STATE_EXPIRES_ON_SECS = Number.parseInt(process.env.PASSPORT_STATE_EXPIRES_ON_SECS ?? '60');

export const digestProviderResponse = async (
    request: Record<string, any>,
): Promise<{
    profile: StandarizedUserProfile;
    state: any;
}> => {
    var state = request.state;
    if (request.state) {
        state = decrypt(request.state);
        if (state != null) {
            state = JSON.parse(state);
            state.expires_on = Date.now() + PASSPORT_STATE_EXPIRES_ON_SECS * 1000; // 60 seconds to expire
        }
    }

    const redirectUriBase = state.redirect_uri
        ? new URL(state.redirect_uri).origin
        : (process.env.REDIRECT_URI_BASE ?? ``);

    switch (request.provider) {
        case 'google':
            try {
                const token = await getGoogleTokens(request.code, redirectUriBase);
                const profile = await getUserProfile(token as Record<string, any>);
                const providerResponse = { profile, state };
                if (providerResponse.state?.redirect_uri) {
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}`;
                }
                return providerResponse;
            } catch (error) {
                throw error;
            }

        case 'twitter':
            try {
                const token = await getTwitterTokens(request.code, redirectUriBase);
                const profile = await getUserProfile(token as Record<string, any>);
                const providerResponse = { profile, state };
                if (providerResponse.state?.redirect_uri) {
                    const uriArgumentsChar =
                        providerResponse.state.redirect_uri.toString().indexOf('?') == -1 ? '?' : '&';
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}${uriArgumentsChar}state=${encrypt(JSON.stringify(providerResponse))}`;
                }
                return providerResponse;
            } catch (error) {
                throw error;
            }

        case 'live':
            try {
                const token = await getLiveTokens(request.code, redirectUriBase);
                const profile = await getUserProfile(token as Record<string, any>);
                const providerResponse = { profile, state };
                if (providerResponse.state?.redirect_uri) {
                    const uriArgumentsChar =
                        providerResponse.state.redirect_uri.toString().indexOf('?') == -1 ? '?' : '&';
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}${uriArgumentsChar}state=${encrypt(JSON.stringify(providerResponse))}`;
                }
                return providerResponse;
            } catch (error) {
                throw error;
            }
        default:
            console.log('authProviderService: Bad provider!!!');
            console.log(request);
            //Bad provider
            throw 'bad provider!';
    }
};

const getGoogleTokens = (code: string, redirectUriBase: string) =>
    new Promise((resolve, reject) => {
        const provider = 'google';
        if (!process.env.GOOGLE_CLIENT_ID) reject(undefined);

        //https://developers.google.com/identity/protocols/oauth2/web-server#httprest
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type: 'authorization_code',
            code: code,
        };
        const url = 'https://oauth2.googleapis.com/token';
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((res) => {
                res.json().then((response) => {
                    response.provider = 'google';
                    resolve(response);
                });
            })
            .catch((error) => {
                var errorResponse = {
                    result: 'error',
                    code: 500,
                    message: 'Internal Error',
                };
                if (error) {
                    if (error.response) {
                        errorResponse.code = error.response.status;
                        errorResponse.message = error.response.statusText;
                        if (error.response.data) {
                            error.response.data.code = error.response.status;
                            error.response.data.provider = 'google';
                            errorResponse.message = JSON.stringify(error.response.data);
                            reject(errorResponse);
                        } else {
                            reject(errorResponse);
                        }
                    } else {
                        reject(errorResponse);
                    }
                }
            });
    });
const getLiveTokens = (code: string, redirectUriBase: string) =>
    new Promise((resolve, reject) => {
        const provider = 'live';
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id: process.env.LIVE_CLIENT_ID || '',
            client_secret: process.env.LIVE_CLIENT_SECRET || '',
            redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type: process.env.LIVE_GRANT_TYPE || '',
            /*
            scope: [
                'https://ads.microsoft.com/msads.manage',
                'openid',
                'offline_access',
            ],*/
            code: code,
        };
        const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((res) => {
                res.json().then((response) => {
                    response.provider = 'live';
                    resolve(response);
                });
            })
            .catch((error) => {
                var errorResponse = {
                    result: 'error',
                    code: 500,
                    message: 'Internal Error',
                };
                if (error) {
                    if (error.response) {
                        errorResponse.code = error.response.status;
                        errorResponse.message = error.response.statusText;
                        if (error.response.data) {
                            error.response.data.code = error.response.status;
                            error.response.data.provider = 'google';
                            errorResponse.message = JSON.stringify(error.response.data);
                            reject(errorResponse);
                        } else {
                            reject(errorResponse);
                        }
                    } else {
                        reject(errorResponse);
                    }
                }
            });
    });
const getTwitterTokens = (code: string, redirectUriBase: string) =>
    new Promise((resolve, reject) => {
        const provider = 'twitter';
        if (!process.env.TWITTER_CLIENT_ID) reject(undefined);

        //https://developers.google.com/identity/protocols/oauth2/web-server#httprest
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: `${redirectUriBase}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type: 'authorization_code',
            code_verifier: process.env.TWITTER_CODE_CHALLENGE,
            code: code,
        };
        const url = 'https://api.twitter.com/2/oauth2/token';
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((res) => {
                res.json().then((response) => {
                    response.provider = 'live';
                    resolve(response);
                });
            })
            .catch((error) => {
                var errorResponse = {
                    result: 'error',
                    code: 500,
                    message: 'Internal Error',
                };
                if (error) {
                    if (error.response) {
                        errorResponse.code = error.response.status;
                        errorResponse.message = error.response.statusText;
                        if (error.response.data) {
                            error.response.data.code = error.response.status;
                            error.response.data.provider = 'google';
                            errorResponse.message = JSON.stringify(error.response.data);
                            reject(errorResponse);
                        } else {
                            reject(errorResponse);
                        }
                    } else {
                        reject(errorResponse);
                    }
                }
            });
    });
const getUserProfile = (token: Record<string, any>): Promise<StandarizedUserProfile> =>
    new Promise((resolve, reject) => {
        //console.log('getUserProfile->%o', token.provider);
        switch (token.provider) {
            case 'google':
                getGoogleProfile(token)
                    .then((profile) => {
                        resolve(standarizeUserProfile(profile as Record<string, any>));
                    })
                    .catch((error) => {
                        reject(error);
                    });
                break;

            case 'live':
                getLiveProfile(token)
                    .then((profile) => {
                        resolve(standarizeUserProfile(profile as Record<string, any>));
                    })
                    .catch((error) => {
                        reject(error);
                    });
                break;

            case 'twitter':
                getTwitterProfile(token)
                    .then((profile) => {
                        resolve(standarizeUserProfile(profile as Record<string, any>));
                    })
                    .catch((error) => {
                        reject(error);
                    });
                break;
            default:
                reject('unknown-provider');
                break;
        }
    });
const getGoogleProfile = (token: Record<string, any>) =>
    new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token.access_token}`;
        fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token.id_token}` },
        })
            .then((res) => {
                res.json().then((response) => {
                    var profile = response;
                    profile.provider = 'google';
                    resolve(profile);
                });
            })
            .catch((error) => {
                reject(error.response);
            });
    });
const getTwitterProfile = (token: Record<string, any>) =>
    new Promise((resolve, reject) => {
        let userFields = process.env.TWITTER_USER_FIELDS;
        let url = `https://api.twitter.com/2/users/me`;
        if (userFields) url += `?user.fields=${userFields}`;
        fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token.id_token}` },
        })
            .then((res) => {
                res.json().then((response) => {
                    var profile = response;
                    profile.provider = 'twitter';
                    resolve(profile);
                });
            })
            .catch((error) => {
                reject(error.response);
            });
    });
const getLiveProfile = (token: Record<string, any>) =>
    new Promise((resolve, reject) => {
        const url = 'https://graph.microsoft.com/v1.0/me';
        fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token.id_token}` },
        })
            .then((res) => {
                res.json().then((response) => {
                    var profile = response;
                    profile.provider = 'live';
                    resolve(profile);
                });
            })
            .catch((error) => {
                reject(error.response);
            });
    });
const standarizeUserProfile = (profile: Record<string, any>) => {
    var standardProfile: StandarizedUserProfile;

    switch (profile.provider) {
        case 'google':
            standardProfile = {
                id: profile.id,
                firstname: profile.given_name,
                lastname: profile.family_name,
                displayname: profile.name,
                email: profile.email,
                username: profile.email,
                picture: profile.picture,
                provider: profile.provider,
            };
            break;
        case 'live':
            standardProfile = {
                id: profile.id,
                firstname: profile.givenName,
                lastname: profile.surname,
                displayname: profile.displayName,
                email: profile.userPrincipalName,
                username: profile.userPrincipalName,
                picture: null,
                provider: profile.provider,
            };
            break;
        case 'facebook':
            standardProfile = {
                id: profile.id,
                firstname: profile.first_name,
                lastname: profile.last_name,
                displayname: profile.name,
                email: profile.email,
                username: profile.email,
                picture: `https://graph.facebook.com/${profile.id}/picture`, //?height=500 --> https://developers.facebook.com/docs/graph-api/reference/user/picture/?locale=es_ES
            };
            break;
        case 'twitter':
            const splitName = profile.name.split(' ');
            standardProfile = {
                id: profile.id,
                firstname: splitName[0],
                lastname: splitName.length > 1 ? splitName[1] : '',
                displayname: profile.name,
                email: undefined,
                username: profile.username,
                picture: profile.profile_image_url,
                provider: profile.provider,
            };
            break;
        default:
            standardProfile = profile as StandarizedUserProfile;
            break;
    }
    return standardProfile;
};
