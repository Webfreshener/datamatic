import {Validator} from './_validators'
/**
 * @private
 */
let __vBuilder = null;
/**
 * @private
 */
export class ValidatorBuilder {
    /**
     * @constructor
     */
    constructor() {
        if (!_exists(__vBuilder)) {
            _validators.set((__vBuilder = this), {});
        }
        return __vBuilder;
    }

    /**
     * @returns list of validation paths
     */
    list() {
        let _v = _validators.get(this);
        return Object.keys(_v);
    }

    /**
     * @param path
     * @returns item at path reference
     */
    get(path) {
        let _v = _validators.get(this);
        return _exists(_v[path]) ? _v[path] : null;
    }

    /**
     * @param _path
     * @param func
     */
    set(_path, func) {
        if (!_exists(func) || typeof func !== 'function') {
            return "2nd argument expects a function";
        }
        _validators.get(this)[_path] = func;
        return this;
    }

    /**
     * @param {object} _ref
     * @param {string} _path
     */
    create(ref, path) {
        if (!_exists(ref)) {
            throw "create requires object reference at arguments[0]";
        }
        let _signatures = _exists(ref.polymorphic) ?
            ref.polymorphic : (
                Array.isArray(ref) ? ref : [ref]
            );
        let _v = _validators.get(this);
        let _functs = _signatures.map(_sig => {
            if (typeof _sig !== 'object') {
                return new Validator["Default"](path, _sig);
            }
            if (_sig.hasOwnProperty('*')) {
                this.create(_sig['*'], path);
                delete _sig['*'];
                if (Object.keys(_sig) > 0) {
                    return this.create(_sig, path);
                }
                return;
            }

            let _typeof = global.wf.Str.capitalize(_sig.type);
            let _hasKey = (0 <= Object.keys(Validator).indexOf(_typeof));
            // ObserverBuilder.getInstance().create(path, ref);
            return new Validator[_hasKey ? _typeof : "Default"](path, _sig);
        });
        return _validators.get(this)[path] = (value) => {
            var _result;
            for (let idx in _functs) {
                _result = _functs[idx].exec(value);
                if (typeof _result === "boolean") {
                    return _result;
                }
            }
            return _result;
        };
    }

    /**
     * executes validator `value` with validator at `path`
     * @param path
     * @param value
     */
    exec(path, value) {
        let _v = ValidatorBuilder.getValidators();
        if (!_v.hasOwnProperty(path)) {
            return `validator for '${path}' does not exist`;
        }
        return _v[path](value);
    }

    /**
     * @returns singleton ValidatorBuilder reference
     */
    static getInstance() {
        return new this;
    }

    /**
     * @returns validators WeakMap
     */
    static getValidators() {
        return _validators.get(ValidatorBuilder.getInstance());
    }

    /**
     *
     */
    static create(signature, path) {
        ValidatorBuilder.getInstance().create(signature, path);
    }

    /**
     *
     */
    static getPolymorphic(signature, path) {
        let _attr = path.split(".").pop();
        // tests for element as child element on polymorphic object signature
        if (_exists(signature.elements[_attr])) {
            ValidatorBuilder.create(signature.elements[_attr], path);
        }
    }
}
