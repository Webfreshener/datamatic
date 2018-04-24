import {_dirtyModels, _validators} from "./_references";
import merge from "lodash.merge";

/**
 * flags `model` node as being out of sync with tree
 * @param {Model} model
 */
export const makeDirty = (model) => {
    _dirtyModels.get(model.rxvo)[model.path] = true;
};

/**
 * flags `model` node as being in sync with tree
 * @param {Model} model
 */
export const makeClean = (model) => {
    if (model.isDirty && _dirtyModels.get(model.rxvo)[model.path]) {
        delete _dirtyModels.get(model.rxvo)[model.path];
    }
};

/**
 * Performs model data validation against json-schema
 * @private
 * @param {Model} model
 * @param {json|array|boolean|number|string} value
 * @return {boolean|string|object[]}
 */
export const refValidation = (model, value) => {
    return refAtKeyValidation(model, "", value);
};

/**
 * Performs model data validation at KEY against json-schema
 * @param model
 * @param key
 * @param value
 * @return {boolean|string|string[]}
 */
export const refAtKeyValidation = (model, key, value) => {
    // we don't validate if model is dirty
    if (model.isDirty) {
        return true;
    }

    // obtains preliminary model path
    let path = `${model.validationPath}`;

    // appends key to path if set
    if (key && key.length) {
        path = `${path}/${key}`;
    }

    const _res = validate(model, path, value);

    // tests our results for failure
    if (_res !== true) {
        return _res;
    }

    return true;
};

export const validate = (model, path, value) => {
    // obtains validator reference
    const _v = _validators.get(model.rxvo);
    const _res = _v.exec(path, value);
    // runs validation and returns
    if (_res !== true) {
        return _v.$ajv.errorsText(_res.errors) || "unknown validation error";
    }

    return true;
};

/**
 *
 * @param obj
 */
const getDefaultsForElement = (obj) => {
    const _o = {};

    if (obj.hasOwnProperty("default")) {
        merge(_o, obj.default);
    }

    if (obj.hasOwnProperty("type")) {
        let _m = obj.type.match(/^(object|array)+$/);
        if (_m !== null) {
            let _key = _m[1] === "object" ? "properties" : "items";
            if (obj.hasOwnProperty(_key)) {
                merge(_o, getDefaultsForElement(obj[_key]));
            }
        }
    }

    Object.keys(obj).forEach((prop) => {
        if (obj[prop].hasOwnProperty("default")) {
            _o[prop] = obj[prop].default;
        }

        if ((obj[prop].hasOwnProperty("type"))) {
            if (obj[prop].type.match(/^(object|array)+$/) !== null) {
                if (obj[prop].hasOwnProperty("properties")) {
                    merge(_o, getDefaultsForElement(obj[prop].properties));
                }

                if (obj[prop].hasOwnProperty("items")) {
                    merge(_o, getDefaultsForElement(obj[prop].items));
                }
            }
        }
    });

    delete _o["items"];
    return Object.keys(_o).length ? _o : null;
};

/**
 *
 * @param schema
 * @returns {object|null}
 */
export const getDefaults = (schema) => {
    const _o = {};

    if (schema.hasOwnProperty("default")) {
        merge(_o, schema.default);
    }

    if (schema.hasOwnProperty("properties")) {
        merge(_o, getDefaultsForElement(schema.properties));
    }

    if (schema.hasOwnProperty("items")) {
        merge(_o, getDefaultsForElement(schema.items));
    }

    delete _o["items"];

    return Object.keys(_o).length ? _o : null;
};

/**
 *
 * @param schema
 * @returns {*}
 */
export const getPatternPropertyDefaults = (schema) => {
    let _o = {};

    if (schema === null || schema === void(0)) {
        return null;
    }

    if (schema.hasOwnProperty("patternProperties")) {
        let _propObj = {};
        Object.keys(schema.patternProperties).forEach((prop) => {
            _propObj[prop] = getDefaultsForElement(schema.patternProperties);
        });
        merge(_o, _propObj);
    }

    return  Object.keys(_o).length ? _o : null;
};

/**
 * Navigates given object by path
 * @param path
 * @param toWalk
 * @param delimiter
 * @returns {{} & any}
 */
export const walkObject = (path, toWalk, delimiter = "/") => {
    let _s = Object.assign({}, toWalk);
    path.split(delimiter).forEach((part) => {
        if (part !== "") {
            _s = _s[part];
        }
    });
    return _s;
};