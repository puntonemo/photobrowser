import { CoreRequest, ServiceManager } from '@core';

export function authGlobalInterceptor(
    request: CoreRequest,
    service: ServiceManager,
): Record<string, any> | Promise<Record<string, any>> | boolean | Promise<boolean> | void {

    //Intercep request and add auth property based on session.auth
    if (request.session.auth !== undefined) request.auth = request.session.auth;

    //Act as a guard. If service is tagged as public, allow it
    if (service.meta?.public === true) return true;

    //... If it's not, check user has signed in
    if (!request.auth) return false;
}
