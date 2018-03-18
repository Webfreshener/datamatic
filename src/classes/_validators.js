import {_exists, wf, _validPaths, _vBuilders} from "./_references";
/**
 * Holder for Validator Class References
 */
export const Validator = {};
/**
 * @private
 */
export class BaseValidator {
    /**
     * @constructor
     */
    constructor(path, signature, jsd) {
        if (!jsd)
        {
            throw `JSD is required for '${path}'`;
        }
        this.path = path;
        this._signature = JSON.stringify(signature);
        this.jsd = jsd;
        this.validations[path] = -1;
    }

    get signature() {
        return JSON.parse(this._signature);
    }

    /**
     * invokes `exec` for validator on object child elements
     *
     * @param path
     * @param value
     * @returns {*}
     */
    call(path, value) {
        // attempt to reference validator at path
        let __ = _vBuilders.get(this.jsd).get(path);
        // tests for existence of validator
        if (_exists(__) && typeof __ === "function") {
            const e = __(value);
            // sets result of validation
            this.validations[path] = ((typeof e) !== "string") || e;
            return e;
        }
        // returns error message if unable to find validator for path
        return `'${path}' has no validator defined`;
    }

    /**
     * tests typeof value reference
     *
     * @param type
     * @param value
     * @returns {Boolean|String}
     */
    checkType(type, value) {
        // evaluation closure to test typeof element
        let _eval = (type, value) => {
            let _x = (typeof type !== "string") ? this.jsd.getClass([type]) : type;
            // tests for special '*' (wildcard) type
            if (_x === "*") {
                return true;
            }
            // tests for explicit type match
            if (_x.match(new RegExp(`^${typeof value}$`, "i")) === null) {
                return `'${this.path}' expected ${type}, type was '<${typeof value}>'`
            }
            return true;
        };
        // tests that param `type` exists
        if (_exists(type)) {
            // tests if `type` is Array
            // -- NOTE: this should allow an Array of Types
            // -- might want re-evaluate this
            if (Array.isArray(type)) {
                // tests each `type` specified in Set
                return type.some((k) => {
                   return _eval(type[k], value) === "boolean"
                });
            }
            // performs eval on type against value
            return _eval(type, value);
        } else {
            // returns error string if `type` was undefined
            return `type '${type}' for ${this.path} was undefined`;
        }
    }

    /**
     * default exec method, must be overridden by subclass
     *
     * @param value
     * @returns {string}
     */
    exec(value) {
        return `${wf.utils.Fun.getClassName(this)} requires override of 'exec'`;
    }

    /**
     * getter returns Hash of all validations defined for this document
     *
     * @returns {V}
     */
    get validations() {
        return _validPaths.get(this.jsd);
    }
}
Validator.Array = class Arr extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }

    /**
     * validates Object datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        if (!Array.isArray(value)) {
            return `array expected t '${this.path}'`;
        }
        for (let __ in value) {
            let e = this.call(this.path, value[__]);
            if ((typeof e) === "string") {
                return e;
            }
        }
        return true;
    }
}
/**
 * @private
 */
Validator.Object = class Obj extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates Object datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let _iterate = (key, _val) => {
            // replaces "." path with ""
            let _p = `${this.path}.${key}`;
            // obtains Validator Builder for this Document
            let _v = _vBuilders.get(this.jsd);
            // tests for Validator for path
            if (!_v.get(_p)) {
                // creates new Validator for path using signature for key
                let _sig = this.signature.elements[key] || this.signature.elements["*"];
                _vBuilders.get(this.jsd).create(_sig, _p, this.jsd);
            }
            // calls the validator with path and value
            let e = this.call(_p, _val);
            if ((typeof e) === "string") {
                return e;
            }
        };
        if (typeof value === "object") {
            if (!Array.isArray(value)) {
                for (let _k in value) {
                    let _res = _iterate(_k, value[_k]);
                    if (typeof _res === "string") {
                        return _res;
                    }
                }
            }
            else {
                for (let __ in value) {
                    let e = this.call(this.path, value[__]);
                    if (typeof e === "string") {
                        return e;
                    }
                }
            }
            return true;
        }
        else {
            return `${this.path} expected value of type 'Object'. Type was '<${typeof value}>'`;
        }
    }
};
/**
 * @private
 */
Validator.Boolean = class Bool extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates Boolean datatypes
     *
     * @param value
     * @returns {Boolean|String}
     */
    exec(value) {
        return this.checkType("boolean", value);
    }
};

/**
 * @private
 */
Validator.String = class Str extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates String datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let __ = this.checkType("string", value);
        if ((typeof __) === "string") {
            return __;
        }
        if (_exists(this.signature.restrict)) {
            let _rxStr;
            let _rxFlags;
            /*
                Allow restrict to be Array or String
                if Array, first element is rx string, second element is rx flags
             */
            if (Array.isArray(this.signature.restrict)) {
                _rxStr = this.signature.restrict[0];
                _rxFlags = this.signature.restrict.length > 1 ? this.signature.restrict[1] : "";
            } else {
                _rxStr = this.signature.restrict;
                _rxFlags = "";
            }

            if (!_exists(new RegExp(_rxStr.replace(/[\\\\]{2,}/g, "\\"), _rxFlags).exec(value))) {
                return `value '${value}' for ${this.path} did not match required expression`;
            }
        }
        return true;
    }
};

/**
 * @private
 */
Validator.Number = class Num extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates Number datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let __ = this.checkType("number", value);
        if (typeof __ === "string") {
            return __;
        }
        // attempts to cast to number
        return !isNaN(Number(value)) ? true : `${this.path} was unable to process '${value}' as Number`;
    }
};

/**
 * @private
 */
Validator.Function = class Fun extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates Function datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let _x = typeof this.signature.type === "string" ?
            this.signature.type :
            wf.Fun.getConstructorName(this.signature.type);
        let _fn = wf.Fun.getConstructorName(value);
        return _x === _fn ? true :
            `${this.path} requires '$_x' got '<${_fn}>' instead`;
    }
};

/**
 * @private
 */
Validator.Default = class Def extends BaseValidator {
    /**
     * @constructor
     * @param path
     * @param signature
     * @param jsd
     */
    constructor(path, signature, jsd) {
        super(path, signature, jsd);
    }
    /**
     * validates unknown (default) datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        const _testValidator = (type, value) => {
            if (type === "*") {
                return true;
            }
            let _val = Validator[wf.Str.capitalize(type)];
            if (!_exists(_val)) {
                return `'${this.path}' was unable to obtain validator for type '<${type}>'`;
            }
            let _ = new _val(this.path, this.signature);
            return _.exec(value);
        };
        let _x = typeof this.signature.type === "string"
            ? this.jsd.getClass(this.signature.type)
            : this.signature.type;
        let _tR = this.checkType(_x, value);
        if (typeof _tR === "string") {
            return _tR;
        }
        if (Array.isArray(_x)) {
            let _ = _x.map(itm => {
                let _clazz = this.jsd.getClass(itm);
                return _testValidator(_clazz, value);
            });
            return (0 <= _.indexOf(true)) ? true : _[_.length - 1];
        }
        return _testValidator(_x, value);
    }
};
