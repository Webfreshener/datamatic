/**
 * @private
 */
import {_exists, _validators, _validPaths, wf} from "./_references";
import {Validator} from "./_validators"
/**
 * @private
 */
export class ValidatorBuilder {
    /**
     * @constructor
     */
    constructor() {
        let inst = _validators.get(this);
        if (!_exists(inst)) {
            _validators.set( inst = this, {});
        }
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
     * @param path
     * @param func
     */
    set(path, func) {
        if (!_exists(func) || typeof func !== "function") {
            return "2nd argument expects a function";
        }
        _validators.get(this)[path] = func;
        return this;
    }

    /**
     *
     * @param ref
     * @param path
     * @param elRef
     * @returns {function}
     */
    create(ref, path, elRef) {
        if (!_exists(ref) ) {
            throw "create requires object reference at arguments[0]";
        }
        let _signatures = _exists(ref.polymorphic) ?
            ref.polymorphic : (
                Array.isArray(ref) ? ref : [ref]
            );
        let _v = _validators.get(this);
        let _functs = _signatures.map(_sig => {
            if (typeof _sig !== "object") {
                return new Validator["Default"](path, _sig, elRef.jsd);
            }
            if (_sig.hasOwnProperty("*")) {
                this.create(_sig["*"], path, elRef);
                delete _sig["*"];
                if (Object.keys(_sig) > 0) {
                    return this.create(_sig, path, elRef);
                }
                return;
            }
            let _typeof = wf.Str.capitalize(_sig.type);
            let _hasKey = (0 <= Object.keys(Validator).indexOf(_typeof));
            return new Validator[_hasKey ? _typeof : "Default"](path, _sig, elRef.jsd);
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
        let _v = _validators.get(this);
        if (!_v.hasOwnProperty(path)) {
            return `validator for '${path}' does not exist`;
        }
        return _v[path](value);
    }
}
