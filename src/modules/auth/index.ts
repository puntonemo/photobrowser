import { CoreModule } from '@core';
import * as services from './services';
import * as interceptors from './interceptors';

async function init() {
    console.log('🔐 auth module init');
}

export const authModule = new CoreModule('auth', {
    services,
    init,
    globalInterceptor: interceptors.authGlobalInterceptor,
});
