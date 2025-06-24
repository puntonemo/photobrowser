import { CoreModule } from '@core';
import * as services from './services';
import * as globalRequestManagers from './requestManagers';

async function init() {
    console.log('🔐 auth module init');
}

export const authModule = new CoreModule('auth', {
    services,
    init,
    globalInterceptor: globalRequestManagers.globalRequestInterceptor,
    interceptor: globalRequestManagers.moduleRequestInterceptor,
});
