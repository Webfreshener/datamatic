import {_schemaSignatures, _validators} from "../_references";
import {walkObject} from "../utils";

export const getLegacyModelSchemaForKey = (owner, id) => {
    let schemaMatch = null;
    const schemas = _schemaSignatures.get(owner);

    schemas.schemas.some((schema) => {
        const schemaId = (schema.hasOwnProperty("$id") && schema.$id) ||
            (schema.hasOwnProperty("id") && schema.id);
        if (schemaId === id) {
            schemaMatch = schema;
            return true;
        }
        return false;
    });

    return schemaMatch;
};

export const getLegacyModelSchemaForPath = (owner, path) => {
    let schemaId;
    if (path.indexOf("#") > -1) {
        const pathSegments = path.split("#");
        schemaId = pathSegments[0];
        path = pathSegments[1];
    } else {
        schemaId = _validators.get(owner).path;
    }

    return walkObject(path, getLegacyModelSchemaForKey(owner, schemaId));
};

export const getLegacyModelPathValue = (owner, path) => {
    let reference = owner.model;
    path = path.replace(/\/?(properties|items)+\//g, ".").replace(/^\./, "");
    path.split(".").forEach((step) => {
        if (reference && Object.prototype.hasOwnProperty.call(reference, step)) {
            reference = reference[step];
        }
    });

    return reference;
};
