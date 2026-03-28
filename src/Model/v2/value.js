const isObject = (value) => value !== null && typeof value === "object";

const isPlainObject = (value) => {
    if (!isObject(value) || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

export const cloneValue = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => cloneValue(item));
    }

    if (isPlainObject(value)) {
        const clone = {};

        Object.keys(value).forEach((key) => {
            clone[key] = cloneValue(value[key]);
        });

        return clone;
    }

    return value;
};

export const serializeValue = (value) => {
    if (value &&
        Object.prototype.hasOwnProperty.call(value, "toJSON") &&
        value.toJSON instanceof Function) {
        return value.toJSON();
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeValue(item));
    }

    if (isObject(value)) {
        const serialized = {};

        Object.keys(value).forEach((key) => {
            serialized[key] = serializeValue(value[key]);
        });

        return serialized;
    }

    return value;
};

export const inferEmptyValue = (value) => {
    if (Array.isArray(value)) {
        return [];
    }

    if (isPlainObject(value)) {
        return {};
    }

    return null;
};
