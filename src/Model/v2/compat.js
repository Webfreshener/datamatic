import {DataModel} from "./DataModel";

const inferEmptyValueFromSchema = (schema) => {
    if (!schema || typeof schema !== "object") {
        return {};
    }

    if (schema.type === "array" || Array.isArray(schema.items)) {
        return [];
    }

    return {};
};

const getLegacyRootDocument = (owner) => {
    if (!owner || typeof owner !== "object" || !owner.model || !owner.model.$model) {
        throw new TypeError("Legacy model owner is invalid");
    }

    return owner.model.$model;
};

export const buildDataModelForOwner = (owner) => {
    const rootDocument = getLegacyRootDocument(owner);
    return new DataModel({
        value: owner.toJSON(),
        emptyValue: inferEmptyValueFromSchema(owner.schema),
        schema: owner.schema,
        validateInitial: false,
        validator: (value) => rootDocument.validate(value),
    });
};

export const replaceLegacyModelRoot = (owner, value, options = {}) => {
    const {throwOnError = false} = options;
    const rootDocument = getLegacyRootDocument(owner);
    const shadow = buildDataModelForOwner(owner);

    try {
        shadow.replace(value);
        rootDocument.model = shadow.snapshot();
    } catch (error) {
        if (throwOnError) {
            throw error;
        }

        rootDocument.model = value;
        return buildDataModelForOwner(owner);
    }

    return shadow;
};

export const resetLegacyModelRoot = (owner, options = {}) => {
    getLegacyRootDocument(owner).reset(options);
    return buildDataModelForOwner(owner);
};

export const freezeLegacyModelRoot = (owner) => {
    const shadow = buildDataModelForOwner(owner);
    shadow.freeze();
    getLegacyRootDocument(owner).freeze();
    return shadow;
};
