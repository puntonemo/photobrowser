import { CoreModule } from '@core';
import * as services from './services';

export const testModule = new CoreModule('test', services);
