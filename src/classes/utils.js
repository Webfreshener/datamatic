import {_dirtyModels, _oBuilders, _validators} from "./_references";
// import {Model} from "./model";

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

/**
 * Performs model data validation against json-schema
 * @private
 * @param {Model} model
 * @param {JSON|Boolean|Number|String} value
 * @return {boolean}
 */
export const refValidation = (model, value) => {
    return refAtKeyValidation(model, "", value);
};

/**
 * Performs model data validation at KEY against json-schema
 * @param model
 * @param key
 * @param value
 * @return {boolean}
 */
export const refAtKeyValidation = (model, key, value) => {
    // if (!(model instanceof Model)) {
    //     return false;
    // }

    // we don't validate if model is dirty
    if (model.isDirty) {
        return true;
    }

    // marks model as dirty to prevent cascading validation calls
    makeDirty(model);

    // obtains preliminary model path
    let path = `${model.validationPath}`;

    // appends key to path if set
    if (key && key.length) {
        path = `${path}/${key}`;
    }

    // obtains validator reference
    const _v = _validators.get(model.jsd);

    // runs validation...
    const _res = _v.exec(path, value);

    // tests our results for failure
    if (!_res) {
        // obtains errors if available
        const _e = _v.$ajv.errorsText(_res.errors) || "unknown validation error";
        // in case of error, update Observers and return false
        _oBuilders.get(model.jsd).error(model.path, _e);
        return false;
    }

    return true;
};
