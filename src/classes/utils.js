import {_exists} from "./_references";

/**
 * method for reformatting polymorphic paths
 * @param path (string}
 */
export const remapPolypath = (path) => {
    // regex for reformatting polymorphic path entries
    const _remapRx = /(.*)\d\.polymorphic+(.*)/;
    return ((path) => {
        let matched = false;
        path = path.replace(_remapRx, function (match, $1, $2) {
            if (match) {
                matched = true;
            }
            return `${$1}*.polymorphic${$2}`;
        });
        if (matched) {
            path = remapPolypath(path);
        }
        return path;
    })(path);
};

/**
 * @param itm {Object}
 * @returns {string|boolean}
 */
export const ensureKindIsString = (itm) => {
    switch (typeof itm) {
        case "string":
            // wrapped value in template string per lint griping about return type
            return `${itm}`;
        case "object":
            if (itm.hasOwnProperty("type")) {
                return this.ensureKindIsString(itm.type);
            }
    }
    return false;
};

/**
 * Tests if required fields exist on reference object
 * sets default values upon sample object if present
 * @param {Schema} ref - reference object
 * @param {Object} obj - object for evaluation
 * @returns {Object|string} - returns true or error string
 */
export const ensureRequiredFields = (ref, obj) => {
    let oKeys = Object.keys(obj || {});
    let _required = ref.requiredFields;
    try {
        _required.forEach((__) => {
            let _key = _required[__];
            let _path = ref.path.length ? ref.path : "root element";
            if (0 > oKeys.indexOf(_key)) {
                if (_exists(ref.signature[_key].default)) {
                    obj[_key] = ref.signature[_key].default;
                } else {
                    throw `required property "${_key}" is missing for '${_path}'`;
                }
            }
        });
    } catch (e) {
        return e;
    }

    return obj;
};
