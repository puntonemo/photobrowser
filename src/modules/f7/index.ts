import { CoreModule } from '@core';
import * as services from './services';

async function init() {
    console.log('Framework7.io module init');
}

export default new CoreModule('auth', {
    init,
    services,
});
