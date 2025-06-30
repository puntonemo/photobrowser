import Validator, { ValidationSchema } from 'fastest-validator';
import { aliases } from './aliases';

export interface ISchemaValidator {
    validate(object: any, ...params: any): Promise<any>;
}
export type SchemaValidatorError = Record<string, any>[];

export const defaultValidator = new Validator({ useNewCustomCheckerFunction: true });

Object.entries(aliases).forEach(([name, schema]) => defaultValidator.alias(name, schema));

const SchemaValidator: ISchemaValidator = {
    async validate(object: any, ...params: any) {
        if (params.length == 1) {
            const vobject = { ...object };
            const schema = params[0] as ValidationSchema;
            const check = defaultValidator.compile(schema);
            const valid = await check(vobject);
            if (valid === true) {
                return vobject;
            } else {
                throw valid as SchemaValidatorError;
            }
        } else {
            throw [{ message: 'Invalid validator invocation. Expected 2 paremeters' }];
        }
    },
};

type ClassConstructor<T> = {
    new (...args: any[]): T;
};

export const DTOValidator: ISchemaValidator = {
    async validate(object: any, ...params: any) {
        if (params.length === 1 && params[0] instanceof DTOMixin) return await validateMixin(object, params[0]);

        if (params.length > 0 && params[0]?.prototype?.constructor['_validatable'] === true)
            return await validateClass(object, params.shift(), ...params);

        return await doValidation(object, ...params);
    },
};

async function doValidation(object: any, ...params: any) {
    if (
        object &&
        !Array.isArray(object) &&
        typeof object === 'object' &&
        Object.keys(object).length > 0 &&
        object.constructor['_validatable'] !== true
    ) {
        const x: Record<string, any> = {};
        for (let i of Object.entries(object)) {
            i[1] = await doValidation(i[1], ...params);
            x[i[0]] = i[1];
        }
        return x;
    }

    if (Array.isArray(object)) {
        const x: Record<string, any>[] = [];

        for (let i of object) {
            i = await doValidation(i, ...params);
            x.push(i);
        }
        return x;
    }

    if (object?.constructor && object.constructor['_validatable']) {
        const constructor = object.constructor;

        object = instanceToObject(object);

        object = await validateClass(object, constructor as any, { schema: params });

        await Promise.all(
            Object.entries(object)
                .filter(([_key, value]) => Array.isArray(value) || value?.constructor['_validatable'] === true)
                .map(([_key, value]) => {
                    return { name: _key, value: value };
                })
                .map(async (l) => (object[l.name] = await doValidation(l.value, ...params))),
        );

        return object;
    }

    return object;
}
function instanceToObject(obj: any): any {
    const serializedObj: any = {};

    let currentObj = obj;
    while (currentObj) {
        const propertyNames = Object.getOwnPropertyNames(currentObj);

        for (const prop of propertyNames) {
            if (!serializedObj.hasOwnProperty(prop)) {
                const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);
                if (descriptor && typeof descriptor.get === 'function') {
                    serializedObj[prop] = descriptor.get.call(obj);
                } else {
                    serializedObj[prop] = obj[prop];
                }
            }
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return serializedObj;
}

async function validateClass<T>(
    value: object,
    cls: ClassConstructor<T>,
    options?: { schema?: string | string[]; strict?: boolean | 'remove' },
) {
    const t = new cls();

    let schema: ValidationSchema<any> | ValidationSchema<any>[];

    const constructor = t['constructor'];
    const _schema = constructor._validationSchema ?? {};

    if (options?.schema) {
        if (options.schema.includes('*')) {
            schema = _schema;
        } else {
            if (!Array.isArray(options.schema)) options.schema = [options.schema];

            let built = false;
            const schemaBuilder = { $$strict: 'remove' };

            for (const oSchema of options.schema) {
                if (constructor._schemas.hasOwnProperty(oSchema)) {
                    for (const value of constructor._schemas[oSchema]) {
                        schemaBuilder[value] = _schema[value] ?? 'any|optional';
                        built = true;
                    }
                }
            }
            schema = built ? schemaBuilder : _schema;
        }
    } else {
        schema = _schema;
    }

    const validator = defaultValidator;
    const check = validator.compile(schema);
    const isCheckAsync = check.async;
    if (isCheckAsync) _schema.$$async = true;
    let error: any = true;

    if (Array.isArray(value)) {
        for (const item of value) {
            const result = isCheckAsync ? await check(item) : check(item);
            if (result !== true) {
                error = result;
                break;
            }
        }
    } else {
        error = isCheckAsync ? await check(value) : check(value);
    }

    if (error !== true) throw error as SchemaValidatorError;

    return value;
}

export class DTOMixin {
    public targets: Record<string, any>;
    public schema: Record<string, any>;
    constructor(mixin: Record<string, any>) {
        this.targets = {};
        this.schema = { $$strict: true };
        for (const [target, ingredient] of Object.entries(mixin)) {
            const t = new ingredient();
            const constructor = t['constructor'];
            if (!constructor._validationSchema || typeof constructor._validationSchema !== 'object') continue;
            const schema = constructor._validationSchema;
            this.targets[target] = { $$strict: 'remove' };
            for (const [key, validation] of Object.entries(schema)) {
                if (key !== '$$strict') {
                    this.targets[target][key] = validation;
                    if (this.schema[key] === undefined) this.schema[key] = validation;
                }
            }
        }
    }
}
async function validateSchema(object: any, schema: ValidationSchema) {
    const vobject = { ...object };
    const check = defaultValidator.compile(schema);
    const valid = await check(vobject);
    if (valid === true) {
        return vobject;
    } else {
        throw valid as SchemaValidatorError;
    }
}
async function validateMixin(object: Record<string, any>, mixin: DTOMixin) {
    object = await validateSchema(object, mixin.schema);
    const result: Record<string, any> = {};

    for (const [target, schema] of Object.entries(mixin.targets)) {
        result[target] = await validateSchema(object, schema as ValidationSchema);
    }

    return result;
}
export default SchemaValidator;
