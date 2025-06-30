export function Validate(value: any) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor._validatable) target.constructor._validatable = true;
        if (!target.constructor._validationSchema) {
            target.constructor._validationSchema = {};
        }

        target.constructor._validationSchema[propertyKey] = value;
    };
}

export function Schema(...value: string[]) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor._validatable) target.constructor._validatable = true;
        if (!target.constructor._schemas) {
            target.constructor._schemas = {};
        }
        for (const item of value) {
            if (!target.constructor._schemas[item]) {
                target.constructor._schemas[item] = [];
            }
            target.constructor._schemas[item].push(propertyKey);
        }
    };
}

export function ValidateOptions(options: { strict?: boolean | 'remove'; async?: boolean }) {
    return function (constructor: Function) {
        if (!constructor['_validatable']) constructor['_validatable'] = true;
        if (!constructor['_validationSchema']) {
            constructor['_validationSchema'] = {};
        }
        if (options.strict) constructor['_validationSchema'].$$strict = options.strict;
        if (options.async) constructor['_validationSchema'].$$async = options.async;
    };
}
