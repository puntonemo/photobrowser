import { CoreRequest, CoreService, UnauthorizedResponseError } from '@core';

export function globalRequestInterceptor(
    request: CoreRequest,
    service: CoreService,
): Record<string, any> | Promise<Record<string, any>> | boolean | Promise<boolean> | void {
    console.log(
        'globalRequestInterceptor',
        service.manager.moduleName,
        service.manager.serviceName,
        service.manager.name,
    );
    request.params = { ...request.params, globallyManaged: true };
    if (!request.session.viewCount || request.session.viewCount < 3) return true;
    if (request.session.viewCount >= 3 && request.session.viewCount < 5) {
        request.session.viewCount++;
        return { cached: true, viewCount: request.session.viewCount };
    }
    console.log('break here');
    throw UnauthorizedResponseError(`Limit exceeded: ${request.session.viewCount}`);
}

export function moduleRequestInterceptor(_request: CoreRequest, service: CoreService) {
    console.log(
        'moduleRequestInterceptor',
        service.manager.moduleName,
        service.manager.serviceName,
        service.manager.name,
    );
}

export function serviceRequestInterceptor(_request: CoreRequest, service: CoreService) {
    console.log(
        'serviceRequestInterceptor',
        service.manager.moduleName,
        service.manager.serviceName,
        service.manager.name,
    );
}
