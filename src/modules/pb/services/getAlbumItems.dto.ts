import { Validate, ValidateOptions } from '@lib/database';

@ValidateOptions({ strict: true })
export default class {
    @Validate('string')
    id: string;
}
