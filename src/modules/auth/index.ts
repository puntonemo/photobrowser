import { CoreModule } from '@core';
import * as services from './services';

export const authModule = new CoreModule('auth', services, {
    init: async () => {
        console.log('🔐 auth module init');
    },
});
