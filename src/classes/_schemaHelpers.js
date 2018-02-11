import {_exists, _mdRef} from "./_references";
import {MetaData} from "./_metaData";
import {Schema} from "./schema";
import {Set} from "./set";

/**
 * @private
 */
export class SchemaHelpers {
    /**
     * @constructor
     */
    constructor(_ref) {
        if (!_exists(_ref) || !(_ref instanceof Schema)) {
            throw new Error("arguments[0] must be type 'Schema'");
        }
        this._ref = _ref;
    }

    /**
     *
     */
    setObject(obj) {
        obj = this.ensureRequiredFields(obj);
        if (typeof obj === "string") {
            return obj;
        }
        // calls set with nested key value pair
        for (var k in obj) {
            let eMsg = this._ref.model[k] = obj[k];
            if (typeof eMsg === "string") {
                throw new Error( eMsg );
            }
        }
        return this._ref;
    }

    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    setChildObject(key, value) {
        let _mdData = _mdRef.get(this._ref);
        let _s = this.createSchemaChild(key, value, this._ref.options, _mdData);
        if (!_exists(_s) || typeof _s !== "object") {
            return `"${key}" was invalid`;
        }
        const _res = _s.model = value;
        return _s.model = value;
    }

    /**
     * @param {Object} itm
     * @returns {String|Boolean}
     */
    ensureKindIsString(itm) {
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
    }

    /**
     * tests if required fields exist on object
     * @param {Object} obj
     * @returns {true|string} - returns true or error string
     */
    ensureRequiredFields(obj) {
        let oKeys = Object.keys(obj || {});
        let _required = this._ref.requiredFields;
        for (let _ in _required) {
            let _key = _required[_];
            let _path = this._ref.path.length ? this._ref.path : "root element";
            if (0 > oKeys.indexOf(_key)) {
                if (_exists(this._ref.signature[_key].default)) {
                    obj[_key] = this._ref.signature[_key].default;
                } else {
                    return `required property "${_key}" is missing for '${_path}'`;
                }
            }
        }
        return obj;
    }

    /**
     *
     * @param key
     * @param value
     * @param opts
     * @param metaData
     * @returns {Schema|Set|error string} - Schema, Set or error string
     */
    createSchemaChild(key, value, opts, metaData) {
        var _kinds;
        // tests if value is not Array
        if (!Array.isArray(value)) {
            let _d = Object.assign({
                _path: key,
                _root: this._ref.root,
                _jsd: this._ref.jsd,
            }, metaData || {});
            let _md = new MetaData(this._ref, _d);
            let _schemaDef = this._ref.signature[key.split(".").pop()] ||
                this._ref.signature["*"] ||
                this._ref.signature;
            try {
                var _s = new Schema(_schemaDef, opts, _md);
            } catch (e) {
                return e;
            }
            return _s;
        }
        else {
            _kinds = this.getKinds(this._ref.signature[key] || this._ref.signature);
            if (Array.isArray(_kinds)) {
                _kinds = _kinds.map((val) => this.ensureKindIsString(val));
                _kinds = _kinds.filter(itm => itm !== false);
                _kinds = _kinds.length ? _kinds : "*";
                return new Set(_kinds, metaData);
            }
        }
        return "unable to process value";
    }

    /**
     * builds validations from SCHEMA ENTRIES
     * @private
     */
    walkSchema(obj, path) {
        let result = [];
        let _map = function (itm, objPath) {
            return _walkSchema(itm, objPath);
        };
        let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
        for (let _i in _elements) {
            let _k = _elements[_i];
            let itm;
            let objPath = _exists(path) ? (path.length ? `${path}.${_k}` : _k) : _k || "";
            this._ref.validatorBuilder.create(obj[_k], objPath, this._ref);
            // tests for nested elements
            if (_exists(obj[_k]) && typeof obj[_k].elements === "object") {

                if (!Array.isArray(obj[_k].elements)) {
                    result.push(this.walkSchema(obj[_k].elements, objPath));
                }
                else {
                    result.push(_map(obj[_k].elements, objPath));
                }
            }
        }
        return result;
    }

    /**
     * @private
     */
    objHelper(_schema, opts) {
        var _kinds = this.getKinds(_schema);
        if (Array.isArray(_kinds)) {
            _kinds = _kinds.map(function (itm) {
                switch (typeof itm) {
                    case "string":
                        return itm;
                        break;
                    case "object":
                        if (itm.hasOwnProperty("type")) {
                            return itm.type;
                        }
                        break;
                }
                return null;
            });
            _kinds = _kinds.filter(itm => _exists(itm));
            _kinds = _kinds.length ? _kinds : "*";
            return new Set(_kinds || "*", this._ref.metadata);
        }
        return null;
    }

    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    validate(key, value) {
        let _list = this._ref.validatorBuilder.list();
        let _ref;
        //-- attempts to validate
        if (!key.length) {
            return `invalid path "${key}"`;
        }
        let msg;
        if (0 <= _list.indexOf(key)) {
            let _path = [];
            let iterable = key.split(".");
            var _p;
            for (let _k of iterable) {
                _path.push(_k);
                _p = _path.join(".");
            }
            if (!(_ref = this._ref.validatorBuilder.get(_p))) {
                if (!this.options.extensible) {
                    return `'${key}' is not a valid schema property`;
                }
            }
            this._ref.validatorBuilder.set(key, _ref);
        }
        if (typeof (msg = this._ref.validatorBuilder.exec(key, value)) === "string") {
            return msg;
        }
        return true;
    }

    /**
     * @returns {array} list of types decalred by object
     */
    getKinds(_s) {
        var _elems = Object.keys(_s).map(key => {
            return (key === "type") ? _s.type : _exists(_s[key].type) ? _s[key].type : null;
        });
        _elems = _elems.filter(elem => elem !== null);
        return _elems.length ? _elems : null;
    }
}
