import { CoreRequest, ServiceManager, BadRequestResponseError } from '@core';
import { DTOValidator } from '@lib/database';

export async function DTOtransformer(response: any, request: CoreRequest, service: ServiceManager) {
    try {
        const metaSchema = request.params.schema ?? service?.meta?.schema;
        const schema = Array.isArray(metaSchema) ? metaSchema : [metaSchema];
        const validated = await DTOValidator.validate(response, ...schema);
        return validated;
    } catch (error) {
        return BadRequestResponseError(error);
    }
}