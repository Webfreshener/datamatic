import {_exists} from "./_references";

const _remapRx = /(.*)\d\.polymorphic+(.*)/;
export const remapPolypath = (path) => {
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
 * @param {Object} itm
 * @returns {String|Boolean}
 */
export const ensureKindIsString = (itm) => {
    switch (typeof itm) {
        case "string":
            return itm;
        case "object":
            if (itm.hasOwnProperty("type")) {
                return this.ensureKindIsString(itm.type);
            }
            break;
    }
    return false;
};

/**
 * Tests if required fields exist on reference object
 * sets default values upon sample object if present
 * @param {Schema} ref - reference object
 * @param {Object} obj - object for evaluation
 * @returns {true|string} - returns true or error string
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

/**
 * TODO: evaluate for removal -- not showing up in search
 * @returns {array} list of types declared by object
 */
export const getKinds = (_s) => {
    var _elems = Object.keys(_s).map(key => {
        return (key === "type") ?
            _s.type : _exists(_s[key].type) ?
                _s[key].type : null;
    });
    _elems = _elems.filter(elem => elem !== null);
    return _elems.length ? _elems : null;
};
