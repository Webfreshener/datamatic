/**
 * @private
 */
import {_exists, _validators, _validPaths, wf} from "./_references";
import {remapPolypath} from "./utils";
import {Validator} from "./_validators"

/**
 * @private
 */
export class ValidatorBuilder {
    /**
     * @constructor
     */
    constructor() {
        _validators.set(this, {});
    }

    /**
     * Returns list of validation paths
     * @returns {array}
     */
    list() {
        let _v = _validators.get(this);
        return Object.keys(_v);
    }

    /**
     * Gets Validator at `path` from Validator Hash
     * @param path
     * @returns item at path reference
     */
    get(path) {
        let _v = _validators.get(this);
        let r = (_v.hasOwnProperty(path)) ? _v[path] : null;
        return r;
    }

    /**
     * Sets Validator at `path` in Validator Hash
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
     * Creates new Validation for Schema/Set items
     * @param ref - Schema Reference
     * @param path - Path to Element in Tree
     * @param elRef - Container Object Reference
     * @returns {function}
     */
    create(ref, path, elRef) {
        if (!_exists(ref)) {
            throw "ValidatorBuilder create: object reference required at arguments[0]";
        }
        const formatSig = (sig) => {
            return sig.hasOwnProperty("polymorphic") ?
                sig.polymorphic : (Array.isArray(sig) ? sig : [sig]);
        };
        let _signatures = formatSig(ref);
        let _v = _validators.get(this);
        let _functs = [];

        const createFuncts = (_sigs) => {
            _sigs = formatSig(_sigs);
            _sigs.forEach(sig => {
                if (typeof sig !== "object") {
                    _functs.push(new Validator["Default"](path, sig, elRef.jsd || elRef));
                }
                if (sig.hasOwnProperty("*")) {
                    createFuncts(sig["*"].elements || sig["*"].polymorphic || sig["*"]);
                    delete sig["*"];
                    if (Object.keys(sig) > 0) {
                        createFuncts(sig.elements || sig.polymorphic || sig);
                    }
                    return;
                }
                if (sig.hasOwnProperty("type")) {
                    let _typeof = wf.Str.capitalize(sig.type);
                    let _hasKey = (0 <= Object.keys(Validator).indexOf(_typeof));
                    let _path = remapPolypath(path);
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
            for (let idx in _f.$functs) {
                _result = _f.$functs[idx].exec(value);
                if ((typeof _result) === "boolean") {
                    return _result
                } else {
                    e = _result;
                }
            }
            return e || true;
        };

        this.set(remapPolypath(path), _f);
        Object.defineProperty(_f, "$functs", {
            get: () => _functs,
            enumerable: false,
        });
        // returns closure to caller
        return _f;
    }

    /**
     * Executes validator `value` with validator at `path`
     * @param path
     * @param value
     */
    exec(path, value) {
        let _v = _validators.get(this);
        let validators;
        if (!_v.hasOwnProperty(path)) {
            const polyValidate = (validators) => {
                let eMsg = true;
                validators.some((vPath) => {
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
                return Object.keys(_v).filter((v) => {
                    return v.match(new RegExp(rxStr)) !== null;
                });
            };

            const lookupPolyPath = (polyPath) => {
                if (_v.hasOwnProperty(polyPath)) {
                    let pathArr = `${polyPath}`.split(".");
                    const elName = pathArr.pop();
                    polyPath = pathArr.join(".");
                    validators = findPolyPaths(polyPath, elName);
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

            // const _tPath = `${path}`.replace(/(.*)(\.+.*)$/, "$1.*");
            let _tPath = remapPolypath(path);
            if (_v.hasOwnProperty(_tPath)) {
                let rxStr = wf.Str.regexEscape(`${_tPath}.polymorphic`);
                rxStr = `^(${rxStr}+\\.\\d?|${wf.Str.regexEscape(_tPath)})$`;
                rxStr = new RegExp(rxStr);
                validators = Object.keys(_v).filter((v) => {
                    return v.match(rxStr) !== null;
                });
                if (validators.length) {
                    const res = polyValidate(validators);
                    return res;
                }
            }

            let _nPath = _tPath.replace(/\.\d(.*)/, ".*.polymorphic.0$1");
            // console.log(`_nPath: ${_nPath}`);
            if (_v.hasOwnProperty(_nPath)) {
                rxStr = `${wf.Str.regexEscape(_nPath)}`.replace(/\d/, "\\d");
                // rxStr = ;
                validators = Object.keys(_v).filter((v) => {
                    // console.log(`wants to match ${v} against ${rxStr}`);
                    return v.match(new RegExp(rxStr)) !== null;
                });
                // console.log(`validators: ${JSON.stringify(validators)}`);
                if (validators.length) {
                    const res = polyValidate(validators);
                    return res;
                }
            }

            _tPath = remapPolypath(`${_tPath}.polymorphic.0`);

            if (_v.hasOwnProperty(_tPath)) {
                let _eName = _tPath.split(".").pop();
                const _pPath = `${wf.Str.regexEscape(_tPath)}`;
                const rxStr = `^(${_pPath}(\\.\\d)?|${_pPath}\\.\\*?)$`;
                validators = Object.keys(_v).filter((v) => {
                    // console.log(`wants to match ${v} againt ${rxStr}`);
                    return v.match(new RegExp(rxStr)) !== null;
                });
                // console.log(`validators: ${JSON.stringify(validators)}`);
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