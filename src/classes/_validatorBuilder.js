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
     *
     * @returns list of validation paths
     */
    list() {
        let _v = _validators.get(this);
        return Object.keys(_v);
    }

    /**
     * gets Validator at `path` from Validator Hash
     *
     * @param path
     * @returns item at path reference
     */
    get(path) {
        let _v = _validators.get(this);
        return _exists(_v[path]) ? _v[path] : null;
    }

    /**
     * sets Validator at `path` in Validator Hash
     *
     * @param path
     * @param func
     */
    set(path, func) {
        if (!_exists(func) || typeof func !== "function") {
            return "ValidatorBuilder set: expects a function at arguments[1]";
        }
        _validators.get(this)[path] = func;
        return this;
    }
    


    /**
     *
     *
     * @param ref
     * @param path
     * @param elRef
     * @returns {function}
     */
    create(ref, path, elRef) {
        if (!_exists(ref) ) {
            throw "ValidatorBuilder create: object reference required at arguments[0]";
        }
        const formatSig = (sig) => {
            return sig.hasOwnProperty('polymorphic') ?
                sig.polymorphic : (Array.isArray(sig) ? sig : [sig]);
        }
        let _signatures = formatSig(ref);
        let _v = _validators.get(this);
        let _functs = []
        const createFuncts = (_sigs) => {
            _sigs = formatSig(_sigs);
            _sigs.forEach(sig => {
                if (typeof sig !== "object") {
                    _functs.push( new Validator["Default"](path, sig, elRef.jsd));
                }
                if (sig.hasOwnProperty("*")) {
                    createFuncts(sig["*"]);
                    delete sig["*"];
                    if (Object.keys(sig) > 0) {
                        createFuncts(sig);
                    }
                    return;
                }
                if (sig.hasOwnProperty('type')) {
                    let _typeof = wf.Str.capitalize(sig.type);
                    let _hasKey = (0 <= Object.keys(Validator).indexOf(_typeof));
                    const _v = new Validator[_hasKey ? _typeof : "Default"](path, sig, elRef.jsd);
                    _functs.push(_v);
                }
            });
        };
        createFuncts(_signatures, path, elRef, []);
        // evaluates all defined functions, returning true or last error message
        const _f = (value) => {
            let _result;
            for (let idx in _functs) {
                _result = _functs[idx].exec(value);
                if ((typeof _result) === "boolean") {
                    return _result;
                }
            }
            return _result;
        };

        this.set(path, _f);

        // returns closure to caller
        return _f;
    }

    /**
     * executes validator `value` with validator at `path`
     * @param path
     * @param value
     */
    exec(path, value) {
        let _v = _validators.get(this);
        if (!_v.hasOwnProperty(path)) {
            const polyValidate = (validators) => {
                let eMsg = true;
                validators.some((vPath)=> {
                    eMsg = _v[vPath](value);
                    if ((typeof eMsg) === "boolean") {
                        return eMsg;
                    }
                });
                return eMsg;
            };
            let polyPath = `${path}`.replace(/\.+.*$/, ".polymorphic.0");
            if (_v.hasOwnProperty(polyPath)) {
                let pathArr = `${path}`.split(".");
                const elName = pathArr.pop();
                pathArr.push("polymorphic");
                polyPath = pathArr.join("\\.");
                const rxStr = `^(${polyPath}\\.\\d+\\.${elName}|${polyPath}\\.\\d+\.\\*)+`;
                const validators = Object.keys(_v).filter((v) => {
                    return v.match(new RegExp(rxStr));
                });
                if (validators.length) {
                    const res = polyValidate(validators);
                    return res;
                }
            }
            return `validator for '${path}' does not exist`;
        }
        return _v[path](value);
    }
}