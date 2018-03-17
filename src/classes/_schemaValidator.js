import {wf, _exists, _schemaOptions} from "./_references";
// import {MetaData} from "./_metaData";
// import {JSD} from "./jsd";
/**
 * @private
 * @class
 */
export class SchemaValidator {
    /**
     * @constructor
     * @param {object} schema
     * @param {object} options
     */
    constructor(_schema = {}, opts = {extensible: false}) {
        _schemaOptions.set(this, opts);
        let _errorMsg = null;
        this.isValid = () => _errorMsg || true;
        // validates SCHEMA ENTRIES
        _errorMsg = SchemaValidator.eval(_schema, this);
    }

    /**
     *  @param {string} key
     *  @param {string} _type
     */
    validateTypeString(key, _type) {
        //- ignores special `default` object key
        if (key.match(/\.?default+$/)) {
            return true;
        }
        //- hanbdles restrictions defined in `restrict` object key
        if (key.match(/\.?restrict+$/)) {
            if (typeof _type !== "string" || !_type.length) {
                return "restrict requires a Regular Expression String";
            }
            try {
                //- tests for valid RegExp string
                "text".match(new RegExp(_type));
            }
            catch (e) {
                return `Regular Expression provided for '${key}' was invalid. ${e}`;
            }
        }
        //- tests for basic string type declaration {key: {type: "String"} }
        else {
            if (!_exists(this.jsd.getClass(wf.Str.capitalize(_type)))) {
                return `type '<${_type}>' for schema element '${key}' was invalid`;
            }
        }
        return true;
    }

    /**
     *
     * @param key
     * @param params
     * @returns {true|string}
     */
    validateUntypedMembers(key, params) {
        if (Array.isArray(params)) {
            for (let item of params) {
                var _res;
                if (typeof (_res = this.validateSchemaEntry(key, item)) === "string") {
                    return _res;
                }
            }
        }
        else {
            let _p;
            let keyPath;
            if ((_p = (keyPath = key.split(".")).pop()) !== "elements") {
                if (_p === "default") {
                    return true;
                }
                if (Array.isArray(params)) {
                    params = {polymorphic: params};
                }
                if (params.hasOwnProperty("polymorphic")) {
                    return this.validateSchemaEntry(key, params.polymorphic);
                }
                return `value for schema element '${key}' was malformed. Property 'type' was missing`;
            }
            else {
                for (let param of Object.keys(params)) {
                    var _res;
                    let _keys = [].concat(keyPath).concat(param);
                    if (typeof (_res = this.validateSchemaEntry(`${_keys.join(".")}`, params[param])) === "string") {
                        return _res;
                    }
                }
            }
        }
        return true;
    }

    /**
     *
     * @param key
     * @param params
     * @returns {true|string}
     */
    validateSchemaClass(key, params) {
        if (!_exists(key)) {
            throw "key was undefined";
        }
        if (typeof key !== "string") {
            throw `string expected for argument 'key'. Type was '<${typeof key}>'`;
        }
        if (!_exists(params)) {
            throw "params was undefined";
        }
        if (typeof params !== "object") {
            throw `object expected for argument 'params'. Type was '<${typeof params}>'`;
        }
        if (params.type === "*") {
            return true;
        }
        if (Object.keys(params).length === 0) {
            return true;
        }
        if (typeof params.type === "object") {
            return this.validateSchemaEntry(key, params.type);
        }
        if (key.split(".").pop() === "default") {
            if (this._defaults == null) {
                this._defaults = {};
            }
            this._defaults[key] = params;
            return true;
        }
        return `value for schema element '${key}' has invalid type '<${params.type}>'`;
    }

    /**
     * @param {string} key
     * @param {string} sKey
     * @param {object} params
     */
    validateSchemaParamString(key, sKey, params) {
        let _kind = wf.Str.capitalize(params[sKey]);
        let _schemaKeys = this.jsd.schemaRef;
        let opts = _schemaOptions.get(this);
        // handles special `restrict` key
        if (sKey === "restrict") {
            try {
                new RegExp(params[sKey]);
            }
            catch (e) {
                return e;
            }
            return true;
        }
        // rejects values for keys not found in Schema
        if (sKey !== "*" && !_exists(_schemaKeys[sKey]) &&
            opts.extensible === false) {
            return `schema element '${key}.${sKey}' is not allowed`;
        }
        let eMsg = this.validateTypeString(`${key}.${sKey}`, params[sKey]);
        if (typeof eMsg === "string") {
            return eMsg;
        }
        return true;
    }

    /**
     *
     * @param key
     * @param sKey
     * @param _schemaKeys
     * @param params
     * @returns {true|string}
     */
    validateSchemaParam(key, sKey, _schemaKeys, params) {
        var _type;
        let eMsg;
        // rejects unknown element if schema non-extensible
        if (sKey !== "*" && !_exists(_schemaKeys[sKey]) &&
            !_schemaOptions.get(this).extensible) {
            return `schema element '${key}.${sKey}' is not allowed`;
        }
        // returns result of Params String Valdiation
        if (typeof params[sKey] === "string") {
            let eMsg = this.validateSchemaParamString(key, sKey, params);
            if (typeof eMsg === "string") {
                return eMsg;
            }
        }

        // returns result of
        if (typeof _schemaKeys[sKey] === "object") {
            // handles `elements` object
            if (sKey === "elements") {
                let _iterate = Array.isArray(params.elements) ? params.elements : Object.keys(params.elements);
                for (let xKey of _iterate) {
                    if (typeof xKey === "string") {
                        eMsg = this.validateSchemaEntry(`${key}.${xKey}`, params.elements[xKey]);
                        if (typeof eMsg === "string") {
                            return eMsg;
                        }
                    } else {
                        eMsg = this.validateSchemaParam(key, xKey.type, _schemaKeys, params.elements);
                        if (typeof eMsg === "string") {
                            return eMsg;
                        }
                    }
                }
                return true;
            }
            // attempts to handle Native Types
            else {
                _type = _schemaKeys[sKey].type;
                if (!_exists(_type)) {
                    return `type attribute was not defined for ${key}`;
                }
                if (!Array.isArray(_type)) {
                    _type = _type.type;
                }

                if (params.type === "*") {
                    return true;
                } else if (_type.indexOf(params.type) < 0 ) {
                    // console.log(`_schemaKeys['${sKey}']:\n\t_type: ${JSON.stringify(_type)}\n\tparams: ${JSON.stringify(params)}`);
                    return `type attribute was not defined for ${sKey}`;
                }
            }
        }
        // console.log(`failed to identify _schemaKeys['${sKey}']: ${JSON.stringify(params)}`);
        return true;
    }

    /**
     *
     * @param key
     * @param params
     * @param opts
     * @returns {true|string}
     */
    validateSchemaEntry(key, params, opts) {
        let _schemaKeys = this.jsd.schemaRef;
        if (!_exists(opts)) {
            opts = _schemaOptions.get(this);
        }
        if (!_exists(params)) {
            return `${key} was null or undefined`;
        }
        if (typeof params === "boolean") {
            return true;
        }
        if (typeof params === "string") {
            return this.validateTypeString(`${key}`, params);
        }
        if (typeof params === "object") {
            // handled Objects with no `type` element
            if (!params.hasOwnProperty("type")) {
                return this.validateUntypedMembers(key, params);
            }
            // handles Classes/Functions
            if ((this.jsd.getClass(params.type)) == null) {
                return this.validateSchemaClass(key, params);
            }
            // handles child elements
            for (let sKey of Object.keys(params)) {
                let __ = this.validateSchemaParam(key, sKey, _schemaKeys, params);
                if (typeof __ === "string") {
                    return __;
                }
            }
            return true;
        }
        // handles non-object entries (Function, String, Number, Boolean, ...)
        else {
            let _t = typeof params;
            if (_t !== "function") {
                let _ = _schemaKeys[key.split(".").pop()];
                // tests for everything that"s not a string, _object or function
                if (_ !== wf.Str.capitalize(_t)) {
                    return `value for schema element '${key}' has invalid type :: "<${_t}>"`;
                }
            }
            else {
                let _ = wf.Fun.getConstructorName(params);
                // tests for function"s constructor name
                if (_ !== _schemaKeys[key]) {
                    return `value for schema element '${key}' has invalid class or method "<${_}>"`;
                }
            }
            return true;
        }
        // should not have gotten here -- so flag it as error
        return `unable to process schema element '${key}'`;
    }

    /**
     *
     * @returns {*|JSD|*|JSD}
     */
    get jsd() {
        return _schemaOptions.get(this).jsd;
    }

    /**
     *
     * @param _schema
     * @param caller
     * @returns {boolean}
     */
    static eval(_schema, caller) {
        let _errorMsg = true;
        let _iterate = Array.isArray(_schema) ? _schema : Object.keys(_schema);
        for (let _oKey of _iterate) {
            if (_oKey && typeof _oKey === "object") {
                let e = SchemaValidator.eval(_oKey, caller);
                if (typeof e === "string") {
                    _errorMsg = e;
                    break;
                }
                break;
            }
            switch (typeof _schema[_oKey]) {
                case "string":
                    _errorMsg = caller.validateSchemaEntry(_oKey, _schema[_oKey]);
                    break;
                case "object":
                    if (!Array.isArray(_schema[_oKey])) {
                        if (_oKey !== "elements") {
                            _errorMsg = caller.validateSchemaEntry(_oKey, _schema[_oKey]);
                        }
                        else {
                            for (let _x of Object.keys(_schema[_oKey])) {
                                if (typeof (_errorMsg = caller.validateSchemaEntry(_x, _schema[_oKey][_x])) === "string") {
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        for (let _s of _schema[_oKey]) {
                            if (typeof _schema[_oKey][_s] === "string") {
                                _errorMsg = caller.validateTypeString(_oKey, _s);
                            }
                            else {
                                _errorMsg = caller.validateSchemaEntry(_oKey, _s);
                            }
                        }
                    }
                    break;
                case "boolean":
                    _errorMsg = caller.validateSchemaEntry(_oKey, _schema[_oKey]);
                    break;
                default:
                    _errorMsg = `value for schema element '${_oKey}' was invalid`;
            }
        }
        return _errorMsg;
    }
}
