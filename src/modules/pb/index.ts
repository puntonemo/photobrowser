import { CoreModule } from '@core';
import * as services from './services';

export const pbModule = new CoreModule('pb', services, {
    init: async () => {
        console.log('photobrowser module init');
    },
});
