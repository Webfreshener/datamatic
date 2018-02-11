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
            throw `JSD is required for ${path}`;
        }
        this.path = path;
        this.signature = signature;
        this.jsd = jsd;
        this.validations[path] = -1;
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
        let _ = _vBuilders.get(this.jsd).getValidators()[path];
        // tests for existence of validator
        if (_exists(_) && typeof _ === "function") {
            const _r = _(value);
            // sets result of validation
            this.validations[path] = typeof _r !== 'string';
            return _r;
        }
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
        let _eval = (type, value) => {
            let _x = (typeof type !== "string") ? this.jsd.getClass([type]) : type;
            if (_x === '*') {
                return true;
            }
            if (_x.match(new RegExp(`^${typeof value}$`, "i")) === null) {
                return `'${this.path}' expected ${type}, type was '<${typeof value}>'`
            }
            return true;
        };
        if (_exists(type)) {
            if (Array.isArray(type)) {
                let __ = null;
                let k;
                for (k in type) {
                    if (typeof (__ = _eval(type[k], value)) === "boolean") {
                        return __;
                    }
                }
                return __;
            }
            return _eval(type, value);
        }
        else {
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

    get validations() {
        return _validPaths.get(this.jsd);
    }
}
/**
 * @private
 */
Validator.Object = class Obj extends BaseValidator {
    /**
     * validates Object datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let _iterate = (key, _val) => {
            let _p = `${this.path}.${key}`;
            let _v = _vBuilders.get(this.jsd).getValidators();
            if (!_v.hasOwnProperty(_p)) {
                _vBuilders.get(this.jsd).create(this.signature.elements[key], _p, this);
            }
            let _ = this.call(_p, _val);
            if (typeof _ === "string") {
                return _;
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
                for (let _ in value) {
                    let e = this.call(this.path, value[_]);
                    if (typeof e === 'string') {
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
     * validates Number datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        let _ = this.checkType("number", value);
        if (typeof _ === "string") {
            return _;
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
     * validates unknown (default) datatypes
     *
     * @param value
     * @returns {*}
     */
    exec(value) {
        const _testValidator = (type, value) => {
            if (type === '*') {
                return true;
            }
            let _val = Validator[wf.Str.capitalize(type)];
            if (!_exists(_val)) {
                return `'${this.path}' was unable to obtain validator for type '<${type}>'`;
            }
            let _ = new _val(this.path, this.signature);
            return _.exec(value);
        };
        let _x = typeof this.signature.type === 'string'
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
