import { DTOValidator } from '../validator';

export const dto = {
    type: 'custom',
    custom: async (value, errors, schema) => {
        if (!value && schema.optional === true) return value;
        try {
            await DTOValidator.validate(value, schema.dto);
            return value;
        } catch (error) {
            for (const item of error as Array<any>) {
                errors.push(item);
            }
            return value;
        }
    },
};
