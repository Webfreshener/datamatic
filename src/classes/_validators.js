const Validator = {};
/**
 * @private
 */
class BaseValidator {
    /**
     * @constructor
     */
    constructor(path, signature) {
        this.path = path;
        this.signature = signature;
    }

    /**
     *
     */
    call(path, value) {
        let _ = ValidatorBuilder.getValidators()[path];
        if (_exists(_) && typeof _ === "function") {
            return _(value);
        }
        return `'${path}' has no validator defined`;
    }

    /**
     *
     * @param type
     * @param value
     * @returns {Boolean|String}
     */
    checkType(type, value) {
        let _eval = (type, value) => {
            let _x = (typeof type !== "string") ? _jsd_.getClass([type]) : type;
            if (_x.match(new RegExp(`^${typeof value}$`, "i")) === null) {
                return `'${this.path}' expected ${type}, type was '<${typeof value}>'`
            }
            return true;
        }
        if (_exists(type)) {
            if (Array.isArray(type)) {
                var _ = null;
                for (k in type) {
                    if (typeof (_ = _eval(type[k], value)) === "boolean") {
                        return _;
                    }
                }
                return _;
            }
            return _eval(type, value);
        }
        else {
            return `type for ${this.path} was undefined`;
        }
        return true;
    }

    /**
     *
     */
    exec(value) {
        return `${wf.utils.Fun.getClassName(this)} requires override of 'exec'`;
    }
}
/**
 * @private
 */
Validator.Object = class Obj extends BaseValidator {
    exec(value) {
        let _iterate = (key, _val) => {
            let _p = `${this.path}.${key}`;
            let _v = ValidatorBuilder.getValidators();
            if (!_v.hasOwnProperty(_p)) {
                ValidatorBuilder.create(this.signature.elements[key], _p);
            }
            let _ = this.call(_p, _val);
            if (typeof _ === "string") {
                return _;
            }
        }
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
        // should never hit this
        return `${this.path} was unable to be processed`;
    }
}
/**
 * @private
 */
Validator.Boolean = class Bool extends BaseValidator {
    exec(value) {
        return this.checkType("boolean", value);
    }
}
/**
 * @private
 */
Validator.String = class Str extends BaseValidator {
    exec(value) {
        let _;
        if (typeof (_ = this.checkType("string", value)) === "string") {
            return _;
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
                _rxFlags = this.signature.length > 1 ? this.signature.restrict[1] : "";
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
}
/**
 * @private
 */
Validator.Number = class Num extends BaseValidator {
    exec(value) {
        let _ = this.checkType("number", value);
        if (typeof _ === "string") {
            return _;
        }
        // attempts to cast to number
        return !isNaN(new Number(value)) ? true : `${this.path} was unable to process '${value}' as Number`;
    }
}
/**
 * @private
 */
Validator.Function = class Fun extends BaseValidator {
    exec(value) {
        let _x = typeof this.signature.type === 'string' ? this.signature.type : _global.wf.Fun.getConstructorName(this.signature.type);
        let _fn = _global.wf.Fun.getConstructorName(value);
        return _x === _fn ? true : `${this.path} requires '$_x' got '<${_fn}>' instead`;
    }
}
/**
 * @private
 */
Validator.Default = class Def extends BaseValidator {
    exec(value) {
        _testValidator = (type, value) => {
            let _val = Validator[_global.wf.Str.capitalize(type)];
            if (!_exists(_val)) {
                return `'${this.path}' was unable to obtain validator for type '<${type}>'`;
            }
            let _ = new _val(this.path, this.signature);
            return _.exec(value);
        }
        var _x = typeof this.signature.type === 'string' ? _jsd_.getClass(this.signature.type) : this.signature.type;
        let _tR = this.checkType(_x, value);
        if (typeof _tR === "string") {
            return _tR;
        }
        if (Array.isArray(_x)) {
            let _ = _x.map(itm => {
                let _clazz = _jsd_.getClass(itm);
                return _testValidator(_clazz, value);
            });
            return (0 <= _.indexOf(true)) ? true : _[_.length - 1];
        }
        return _testValidator(type, value);
    }
}
