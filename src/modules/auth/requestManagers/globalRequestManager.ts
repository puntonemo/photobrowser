import { CoreRequest, CoreService, UnauthorizedResponseError } from '@core';

export function globalRequestManager(
    request: CoreRequest
): Record<string, any> | Promise<Record<string, any>> | boolean | Promise<boolean> | void {
    if (!request.session.viewCount || request.session.viewCount < 3) return true;
    if (request.session.viewCount >= 3 && request.session.viewCount < 5) {
        request.session.viewCount++;
        return { cached: true, viewCount: request.session.viewCount };
    }
    console.log('break here');
    throw UnauthorizedResponseError(`Limit exceeded: ${request.session.viewCount}`);
}
