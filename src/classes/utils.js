import {_dirtyModels, _validators} from "./_references";

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

export const getRoot = (model) => {
    return Object.assign({}, model.rxvo.model);
};

/**
 *
 * @param schema
 * @returns {object}
 */
export const getDefaults = (schema) => {
    const _o = {};
    if (schema.hasOwnProperty("default")) {
        Object.assign(_o, schema.default);
    }

    if (schema.hasOwnProperty("properties")) {
        Object.keys(schema.properties).forEach((prop) => {
            if (schema.properties[prop].hasOwnProperty("default")) {
                _o[prop] = schema.properties[prop].default;
            }

            if ((schema.properties[prop].hasOwnProperty("type"))) {
                if (schema.properties[prop].type.match(/^(object|array)+$/) !== null) {
                    _o[prop] = getDefaults(schema.properties[prop]);
                }
            }
        });
    }

    return _o;
};

/**
 * Navigates given object by path
 * @param path
 * @param toWalk
 * @param delimiter
 * @returns {{} & any}
 */
export const walkObject = (path, toWalk, delimiter = "/" ) => {
    let _s = Object.assign({}, toWalk);
    path.split(delimiter).forEach((part) => {
        if (part !== "") {
            _s = _s[part];
        }
    });
    return _s;
};