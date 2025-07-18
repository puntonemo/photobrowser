import { CoreModule } from '@core';
import * as services from './services';
import { Repositories } from 'model';
import { User } from 'model/Users';

async function init() {
    console.log('test');
    const user: User | undefined = await Repositories.Users.getOne({ id: '1', schema: 'list', credentials: true });
}

export default new CoreModule('test', { services, init });
