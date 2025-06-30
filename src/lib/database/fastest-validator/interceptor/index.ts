import { BadRequestResponseError, CoreRequest, ServiceManager } from '@core';
import { DTOValidator } from '../validator';

export async function DTOInterceptor(
    request: CoreRequest,
    service: ServiceManager,
): Promise<Record<string, any> | boolean | void> {
    if (service.meta?.DTO) {
        try {
            let validationError: any = false;
            request.params = await DTOValidator.validate(request.params, service.meta.DTO).catch((error) => {
                validationError = error;
            });
            if (validationError) return BadRequestResponseError(validationError);
            return true;
        } catch (error) {
            return BadRequestResponseError(error);
        }
    }
}
