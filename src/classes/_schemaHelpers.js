import {_exists, _mdRef, _validPaths} from "./_references";
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
                throw new Error(eMsg);
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
        let _s = this.createSchemaChild(key, value, this._ref.options || {}, _mdData);
        if (typeof _s === "string") {
            return _s;
        } else if (!_exists(_s) || typeof _s !== "object") {
            return `"${key}" was invalid`;
        }
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
        let _s; // will be set with Schema | Set
        let _d = Object.assign({
            _path: key,
            _root: this._ref.root,
            _jsd: this._ref.jsd,
        }, metaData || {});
        let _md = new MetaData(this._ref, _d);
        // tests if value is not Array
        if (!Array.isArray(value)) {
            let _schemaDef = this._ref.signature[key.split(".").pop()] ||
                this._ref.signature["*"] ||
                this._ref.signature;
            try {
               _s  = new Schema(_schemaDef, opts, _md);
            } catch (e) {
                return e.message;
            }
            return _s;
        }
        else {
            try {
                let sig = this._ref.signature[key] || this._ref.signature;
                _s = new Set(sig, opts, _md);
            } catch (e) {
                return e.message;
            }
            return _s;
        }
        return "unable to process value";
    }

    /**
     * builds validations from SCHEMA ENTRIES
     * @private
     */
    walkSchema(obj, path) {
        let result = [];
        const _self = this;
        let _map = function (itm, objPath) {
            return _self.walkSchema(itm, objPath);
        };
        let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
        for (let _i in _elements) {
            let _k = _elements[_i];
            let itm;
            let objPath = _exists(path) ? (path.length ? `${path}.${_k}` : _k) : _k || "";
            if (typeof _k === "object") {
                return this.walkSchema(_k.elements, objPath)
            }
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
                if (!this._ref.options.extensible) {
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

    /**
     * utility method for testing values at given keys in schema path
     * @param t
     * @param _pathKeys
     * @param _childSigs
     * @param value
     * @returns {boolean}
     */
    testPathkeys(t, _pathKeys, _childSigs, value) {
        if ((typeof _pathKeys) === "string") {
            _pathKeys = [_pathKeys];
        }
        for (let __ in _pathKeys) {
            let k = _pathKeys[__];
            let _schema;
            // derives path for element
            let _key = this._ref.path.length ? `${this._ref.path}.${k}` : k;
            let kP = Schema.concatPathAddr(this._ref.path, _key);
            if (_exists(_childSigs[`${k}`])) {
                _schema = _childSigs[k];
                if (_schema.hasOwnProperty('polymorphic')) {
                    let res = _schema.polymorphic.some((sig) => {
                        let _s = {};
                        _s[k] = sig;
                        return this.testPathkeys(t, _pathKeys, _s, value);
                    });
                    return res;
                }
            }
            else {
                // attempts to find wildcard element name
                if (_exists(_childSigs["*"])) {
                    // applies schema
                    _schema = _childSigs["*"].polymorphic || _childSigs["*"];
                    // creates Validator for path
                    this._ref.validatorBuilder.create(_schema, _key, this._ref);
                } else {
                    // rejects non-members of non-extensible schemas
                    if (!this._ref.isExtensible) {
                        const e = `element '${_key}' is not a valid element`;
                        _validPaths.get(this._ref.jsd)[kP] = e;
                        return false;
                    }
                }
            }

            // handles missing schema signatures
            if (!_exists(_schema)) {
                if (_childSigs.hasOwnProperty('polymorphic')) {
                    return _childSigs.polymorphic.some((sig) => {
                        return this.testPathkeys(t, _pathKeys, sig.elements || sig, value);
                    });
                }

                // attempts to resolve to current signature
                if (this.testPathkeys(t, _key, _childSigs, value)) {
                    return true;
                }

                // rejects non-members of non-extensible schemas
                if (!this._ref.isExtensible) {
                    const e = `element '${_key}' is not a valid element`;
                    _validPaths.get(this._ref.jsd)[kP] = e;
                    return false;
                }
                _schema = Schema.defaultSignature;
            }

            // handles child objects
            if (typeof value === "object") {
                value = this.setChildObject(_key, value);
                if (typeof value === "string") {
                    _validPaths.get(this._ref.jsd)[kP] = value;
                    return false;
                }
                _validPaths.get(this._ref.jsd)[kP] = true;
            }
            // handles scalar values (strings, numbers, booleans...)
            else {
                let eMsg = this.validate(_key, value);
                _validPaths.get(this._ref.jsd)[_key] = eMsg;
                if (typeof eMsg === "string") {
                    _validPaths.get(this._ref.jsd)[kP] = eMsg;
                    this._ref.observerBuilder.error(kP, eMsg);
                    return false;
                }
                return _validPaths.get(this._ref.jsd)[kP] = true;
            }
        }
        return true;
    }
}
