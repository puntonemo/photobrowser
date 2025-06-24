import { CoreRequest, CoreService } from '@core';

export function globalRequestManager(request: CoreRequest, service: CoreService) {
    console.log('globalRequestManager', service.manager.moduleName, service.manager.serviceName, service.manager.name);
    request.params = { ...request.params, globallyManaged: true };
}

export function moduleRequestManager(request: CoreRequest, service: CoreService) {
    console.log('moduleRequestManager', service.manager.moduleName, service.manager.serviceName, service.manager.name);
    request.params = { ...request.params, moduleManaged: true };
}

export function serviceRequestManager(request: CoreRequest, service: CoreService) {
    console.log('serviceRequestManager', service.manager.moduleName, service.manager.serviceName, service.manager.name);
    request.params = { ...request.params, serviceManaged: true };
}
