import {_dirtyModels, _validators} from "./_references";

/**
 * flags `model` node as being out of sync with tree
 * @param {Model} model
 */
export const makeDirty = (model) => {
    _dirtyModels.get(model.jsd)[model.path] = true;
};

/**
 * flags `model` node as being in sync with tree
 * @param {Model} model
 */
export const makeClean = (model) => {
    if (model.isDirty && _dirtyModels.get(model.jsd)[model.path]) {
        delete _dirtyModels.get(model.jsd)[model.path];
    }
};

export const listDirtyItems = (model) => {
    return Object.keys(_dirtyModels.get(model.jsd));
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
    const _v = _validators.get(model.jsd);
    const _res = _v.exec(path, value);
    // runs validation and returns
    if (_res !== true) {
        return _v.$ajv.errorsText(_res.errors) || "unknown validation error";
    }

    return true;
};

export const getRoot = (model) => {
    return Object.assign({}, model.jsd.model);
};
