/**
 * @private
 */
import {_exists, _validators,  wf} from "./_references";
import {remapPolypath} from "./utils";
import {Validator} from "./_validators"
import {JSD} from "./jsd";
/**
 * Regex that matches other Regex
 * todo: look into IDEA's "redundant escape character" warning
 * @type {RegExp}
 */
export const rxRx = /\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/;

/**
 * @private
 */
export class ValidatorBuilder {
    /**
     * @constructor
     */
    constructor(jsd) {
        if ((!jsd) || !(jsd instanceof JSD)) {
            throw "JSD is required at arguments[0]";
        }
        Object.defineProperty(this, "$jsd", {
            get: () => jsd,
            enumerable: false,
        });
        _validators.set(this, {});
        Object.seal(this);
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
        return (_v.hasOwnProperty(path)) ? _v[path] : null;
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
     * resolves all paths that match registered validators
     * @param path
     * @param key
     * @returns {string[]}
     */
    resolvePath(path, key) {
        // escapes regex special chars on `path` string
        path = wf.Str.regexEscape(`${path}`);
        // escapes regex special chars on `key` string
        key = wf.Str.regexEscape(`${key}`);
        // matches path + key OR wildcard OR actual regexp as key
        let rx = new RegExp(`${path}\\.?(${key}+|\\*|${rxRx.toString().replace(/\/(.*)+\//g, '$1')})`);
        // filter paths by Regexp.test
        let _matches = this.list().filter((vItm) => rx.test(vItm));
        // attempts to find an exact string match in the filtered results
        let _exactMatch = _matches.find((vItm) => wf.Str.regexEscape(vItm) === `${path}\\.${key}`);
        return _exactMatch ? [_exactMatch] : _matches;
    }

    /**
     * Creates new Validation for Schema/Set items
     * @param ref
     * @param path
     * @returns {function(*=)}
     */
    create(ref, path) {
        const formatSig = (sig) => {
            return !sig ? [] : sig.hasOwnProperty("polymorphic") ?
                sig.polymorphic : (Array.isArray(sig) ? sig : [sig]);
        };
        let _signatures = formatSig(ref);
        let _v = _validators.get(this);
        let _functs = [];

        const createFuncts = (_sigs) => {
            _sigs = formatSig(_sigs);
            _sigs.forEach(sig => {
                if (typeof sig !== "object") {
                    _functs.push(new Validator["Default"](path, sig, this.$jsd ));
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
                    _v = new Validator[_hasKey ? _typeof : "Default"](_path, sig, this.$jsd);
                    _functs.push(_v);
                }
            });
        };
        createFuncts(_signatures);
        // evaluates all defined functions, returning true or last error message
        const _f = (value) => {
            let _result;
            let e;
            for (let idx in _f.$functs) {
                if (_f.$functs.hasOwnProperty(idx)) {
                    _result = _f.$functs[idx].exec(value);
                    if ((typeof _result) === "boolean") {
                        return _result
                    } else {
                        e = _result;
                    }
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
        if (!_v.hasOwnProperty(path)) {
            return `validator for '${path}' does not exist`;
        }
        return _v[path](value);
    }
}
