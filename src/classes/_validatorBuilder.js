/**
 * @private
 */
import {_exists, _validators, _validPaths, wf} from "./_references";
import {Validator} from "./_validators"
import {Set} from "./set";

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
        let _functs = [];
        const createFuncts = (_sigs) => {
            _sigs = formatSig(_sigs);
            _sigs.forEach(sig => {
                if (typeof sig !== "object") {
                    _functs.push( new Validator["Default"](path, sig, elRef.jsd));
                }
                if (sig.hasOwnProperty("*")) {
                    createFuncts(sig["*"].elements || sig["*"].polymorphic || sig["*"]);
                    delete sig["*"];
                    if (Object.keys(sig) > 0) {
                        createFuncts(sig.elements || sig.polymorphic || sig);
                    }
                    return;
                }
                if (sig.hasOwnProperty('type')) {
                    let _typeof = wf.Str.capitalize(sig.type);
                    let _hasKey = (0 <= Object.keys(Validator).indexOf(_typeof));
                    let _v = new Validator[_hasKey ? _typeof : "Default"](path, sig, elRef.jsd || elRef);
                    _functs.push(_v);
                    let _path = path.replace(/(.*)\.polymorphic\.\d(.*)/, '$1$2');
                    _v = new Validator[_hasKey ? _typeof : "Default"](_path, sig, elRef.jsd || elRef);
                    _functs.push(_v);
                }
            });
        };
        createFuncts(_signatures, path, elRef, []);
        // evaluates all defined functions, returning true or last error message
        const _f = (value) => {
            let _result;
            let e;
            for (let idx in _functs) {
                _result = _functs[idx].exec(value);
                if ((typeof _result) === "boolean") {
                    return _result
                } else {
                    e = _result;
                }
            }
            return e || true;
        };

        this.set(path, _f);
        this.set(path.replace(/(.*)\.polymorphic\.\d(.*)/, '$1$2'), _f);
        // returns closure to caller
        return _f;
    }

    /**
     * executes validator `value` with validator at `path`
     * @param path
     * @param value
     */
    exec(path, value) {
        // console.log(`exec: ${path} value: ${JSON.stringify(value)}`);
        let _v = _validators.get(this);
        let validators;
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
            const findPolyPaths = (_pPath, _eName) => {
                _pPath = wf.Str.regexEscape(_pPath);
                const rxStr = `^(${_pPath}\\.${_eName}+|${_pPath}\\.\\d+\\.${_eName}|${_pPath}\\.\\d+\.\\*)+`;
                // console.log(`rxStr: ${rxStr}`);
                // console.log(Object.keys(_v));
                return Object.keys(_v).filter((v) => {
                    return v.match(new RegExp(rxStr)) !== null;
                });
            }
            const lookupPolyPath = (polyPath) => {
                if (_v.hasOwnProperty(polyPath)) {
                    console.log(`found: ${polyPath}`);
                    let pathArr = `${polyPath}`.split(".");
                    console.log(pathArr);
                    const elName = pathArr.pop();
                    // if (pathA)
                    // pathArr.push("polymorphic");
                    polyPath = pathArr.join(".");
                    // console.log(`seek validators for ${polyPath}`);
                    validators = findPolyPaths(polyPath, elName);
                    // console.log(`validators: ${validators}`);
                    if (validators.length) {
                        const res = polyValidate(validators);
                        return res;
                    }
                }
                return false;
            };

            let polyPath = `${path}`.replace(/\.+.*$/, ".polymorphic.0");
            let res = lookupPolyPath(polyPath);
            if (res) {
                return res;
            }

            const _tPath = `${path}`.replace(/(.*)(\.+.*)$/, "$1.*");
            if (_v.hasOwnProperty(_tPath)) {
                console.log(`'${path} is now ${_tPath}`);
                res = lookupPolyPath(`${_tPath}.polymorphic.0`);
                console.log(`res: ${res}`);
                if (res) {
                    return res;
                }
                return _v[_tPath](value);
            }
            if (_v.hasOwnProperty(`${_tPath}.polymorphic.0`)) {
                let _eName = _tPath.split(".").pop();
                const _pPath = `${wf.Str.regexEscape(_tPath)}\\.polymorphic`;
                const rxStr = `^(${_pPath}\\.\\d+|${_pPath}\\.\\d+\\.\\*)+`;
                validators = Object.keys(_v).filter((v) => {
                    return v.match(new RegExp(rxStr)) !== null;
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