/* ############################################################################
The MIT License (MIT)

Copyright (c) 2016 - 2019 Van Schroeder
Copyright (c) 2017-2019 Webfreshener, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

############################################################################ */
import {_dirtyModels, _validators} from "./_references";
import merge from "lodash.merge";

/**
 * flags `model` node as being out of sync with tree
 * @param {BaseModel} model
 */
export const makeDirty = (model) => {
    _dirtyModels.get(model.owner)[model.path] = true;
};

/**
 * flags `model` node as being in sync with tree
 * @param {BaseModel} model
 */
export const makeClean = (model) => {
    if (model.isDirty && _dirtyModels.get(model.owner)[model.path]) {
        delete _dirtyModels.get(model.owner)[model.path];
    }
};

/**
 * Performs model data validation against json-schema
 * @private
 * @param {BaseModel} model
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

    if (key && key.length) {
        path = `${path}/${key}`;
    }

    return validate(model, path, value);
};

/**
 *
 * @param model
 * @param path
 * @param value
 * @returns {*}
 */
export const validate = (model, path, value) => {
    // obtains validator reference
    const _v = _validators.get(model.owner);
    const _res = _v.exec(path, value);
    // runs validation and returns result or errors
    return _res ? true : _v.$ajv.errorsText(_res.errors);

};

/**
 *
 * @param obj
 */
const getDefaultsForElement = (obj) => {
    let _o = {};
    const _propObj = {};

    if (obj.hasOwnProperty("default")) {
        merge(_o, obj.default);
    }

    if (obj.hasOwnProperty("type")) {
        let _m = obj.type.match(/^(object|array)+$/);
        if (_m !== null) {
            let _key = _m[1] === "object" ? "properties" : "items";
            if (obj.hasOwnProperty(_key)) {
                return merge(_o, getDefaultsForElement(obj[_key]));
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
                    _propObj[prop] = getDefaultsForElement(obj[prop].properties)
                }

                if (obj[prop].hasOwnProperty("items")) {
                    _propObj[prop] = getDefaultsForElement(obj[prop].items)
                }
            }
        }
    });

    _o = merge(_o, _propObj);

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

    if (schema === null || schema === void (0)) {
        return null;
    }

    if (schema.hasOwnProperty("patternProperties")) {
        let _propObj = {};
        Object.keys(schema.patternProperties).forEach((prop) => {
            merge(_o, getDefaultsForElement(schema.patternProperties));
        });
        merge(_o, _propObj);
    }

    return Object.keys(_o).length ? _o : null;
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

/**
 * retrieves ID attribute from schema
 * @param schema
 * @returns {string}
 */
export const getSchemaID = (schema) => {
    const id = ["$id", "id"].filter((id) => schema.hasOwnProperty(id));
    return id.length ? schema[id[0]] : "root#";
};
