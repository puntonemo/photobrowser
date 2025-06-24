import { CoreModule } from '@core';
import * as services from './services';
import * as globalRequestManagers from './requestManagers';

export const authModule = new CoreModule('auth', services, {
    init: async () => {
        console.log('🔐 auth module init');
    },
    globalInterceptor: globalRequestManagers.globalRequestInterceptor,
    interceptor: globalRequestManagers.moduleRequestInterceptor,
});
