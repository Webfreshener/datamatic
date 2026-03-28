import {normalizePath} from "./path";

const isObject = (value) => value !== null && typeof value === "object";

const getObjectChildSchema = (schema, segment) => {
    if (!isObject(schema)) {
        return undefined;
    }

    if (schema.properties &&
        Object.prototype.hasOwnProperty.call(schema.properties, segment)) {
        return schema.properties[segment];
    }

    if (schema.patternProperties) {
        const pattern = Object.keys(schema.patternProperties)
            .find((key) => new RegExp(key).test(`${segment}`));

        if (pattern) {
            return schema.patternProperties[pattern];
        }
    }

    if (isObject(schema.additionalProperties)) {
        return schema.additionalProperties;
    }

    return undefined;
};

export const getSchemaAtPath = (rootSchema, path) => {
    const segments = normalizePath(path);
    let schema = rootSchema;

    for (const segment of segments) {
        if (!isObject(schema)) {
            return undefined;
        }

        if (typeof segment === "number") {
            if (Array.isArray(schema.items)) {
                schema = schema.items[segment];
                continue;
            }

            schema = schema.items;
            continue;
        }

        schema = getObjectChildSchema(schema, segment);
    }

    return schema;
};

export const createSchemaDeletePolicy = (rootSchema) => {
    return (path, context = {}) => {
        const segments = normalizePath(path);
        if (!segments.length) {
            return "root value cannot be deleted";
        }

        const key = segments[segments.length - 1];
        const parentSchema = getSchemaAtPath(rootSchema, segments.slice(0, -1));

        if (!isObject(parentSchema)) {
            return true;
        }

        if (typeof key === "string" &&
            Array.isArray(parentSchema.required) &&
            parentSchema.required.includes(key)) {
            return `required field cannot be deleted: ${key}`;
        }

        if (Array.isArray(context.parentValue) &&
            typeof key === "number" &&
            typeof parentSchema.minItems === "number" &&
            context.parentValue.length <= parentSchema.minItems) {
            return `array element cannot be deleted below minItems: ${parentSchema.minItems}`;
        }

        return true;
    };
};
