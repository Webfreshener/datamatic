import {
    _mdRef, _required_elements, _object, _exists, _schemaHelpers,
    _schemaOptions, _schemaSignatures, _validPaths, _vPaths
} from "./_references";
import {ensureRequiredFields} from "./utils";
import {SchemaHelpers} from "./_schemaHelpers";
import {SchemaValidator} from "./_schemaValidator";
import {JSD} from "./jsd";
import {Model} from "./model";

/**
 * @class Schema
 */
export class Schema extends Model {
    /**
     *
     * @param _signature {Object} - schema definition object
     * @param opts {Object} - schema options
     */
    constructor(_signature = Schema.defaultSignature, opts = Schema.defaultOptions) {
        super(_signature.writeLock || false, arguments[2]);

        if (!_exists(_signature)) {
            throw `Schema requires JSON object at arguments[0]. Got '${typeof _signature}'`;
        }

        // creates instance of SchemaHelpers
        const _sH = new SchemaHelpers(this);

        // freezes Options object to prevent modification
        _schemaOptions.set(this, Object.freeze(opts));

        // initialized Required Elements reference
        _required_elements.set(this, []);

        // stores SchemaHelpers reference for later use
        _schemaHelpers.set(this, _sH);

        // populates Required Elements reference from schema values
        _sH.referenceRequiredElements(_signature);

        _vPaths.set(this, this.path);

        // freezes schema signature to prevent modifications
        const _sig = Object.freeze(_signature || JSD.defaults);
        _schemaSignatures.set(this, JSON.stringify(_sig));

        _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));

        // applies default values (if any) on the model
        this.setDefaults();
    }

    /**
     * Handler for Object Proxy Evaluation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        return {
            get: (t, key) => {
                return key === "$ref" ? this : t[key];
            },
            set: (t, key, value) => {
                let _sH = _schemaHelpers.get(this);
                if (typeof key === "object") {
                    const e = _sH.setObject(key);
                    if (typeof e === "string") {
                        this.observerBuilder.error(this.path, e);
                        return false;
                    }
                    _validPaths.get(this.jsd)[this.path] = true;
                    return true;
                }

                const keyPath = `${this.validationPath}.${key}`.replace(/^\.?(.*)$/, "$1");
                // determines if parent element is Array (Set)
                const inSet = Array.isArray(this.parent.model);
                // calls validate with either full path if in Schema or key if nested in Set
                const _isValid = _sH.validate((!inSet ? keyPath : key), value);
                console.log(`${key} _isValid: "${_isValid}"`);
                if ((typeof _isValid) !== "string") {
                    _validPaths.get(this.jsd)[this.path] = true;
                    if ((typeof value) === "object") {
                        value = _sH.setChildObject(key, value);
                        if ((typeof value) === "string") {
                            _validPaths.get(this.jsd)[this.path] = value;
                            this.observerBuilder.error(this.path, value);
                            return false;
                        }
                    }
                    console.log(`setting ${key} on "${this.path}"`);
                    t[key] = value;
                } else {
                    _validPaths.get(this.jsd)[this.path] = _isValid;
                }

                const _e = this.validate();
                if ((typeof _e) !== "string") {
                    if (this.path.length) {
                        // TODO: should evaluate this block
                        const _p = Schema.concatPathAddr(this.path, key);
                        this.observerBuilder.next(_p, value);
                    }
                    return true;
                }
                this.observerBuilder.error(this.path, _e);
                return false;
            }

        };
    }

    /**
     * utility method to create selector path
     * @param path
     * @param addr
     * @returns {string}
     */
    static concatPathAddr(path, addr) {
        return path.length ? `${path}.${addr}` : addr;
    }

    /**
     * @returns schema signature object
     */
    get signature() {
        return JSON.parse(_schemaSignatures.get(this));
    }

    /**
     * getter for object model
     */
    get model() {
        return _object.get(this);
    }

    /**
     * setter for object model
     * @param value
     */
    set model(value) {
        let e;
        // -- reset the proxy model to initial object state if not locked
        if (!this.isLocked) {
            _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));
        }
        // -- preliminary setting of default values on initial object
        this.setDefaults();
        if (typeof value === "object") {
            const keys = Object.keys(value);
            if (keys.length) {
                keys.forEach((k) => {
                    // -- added try/catch to avoid error in jsfiddle
                    try {
                        this.model[k] = value[k];
                    } catch (e) {
                        _validPaths.get(this.jsd)[this.path] = e;
                        this.observerBuilder.error(this.path, e);
                        return false;
                    }
                });
            }

            // final check for required field and setting of defaults
            let reqErr = ensureRequiredFields(this, value);
            if ((typeof reqErr) === "string") {
                // applies current state of `e` to validation hash
                _validPaths.get(this.jsd)[this.path] = reqErr;
            }

            // tests current state of validation hash
            e = this.validate();
            if (e === true) {
                // tests for writeLock and locks model if set
                if (_mdRef.get(this).writeLock && !this.isLocked) {
                    this.lock();
                }
                // calls next's observable to update subscribers
                this.observerBuilder.next(this.path, this);
                return true;
            } else {
                this.observerBuilder.error(this.path, e);
                return false;
            }
        } else {
            e = `unable to set scalar value on model at ${this.path.length ? this.path : "."}`;
            _validPaths.get(this.jsd)[this.path] = e;
            this.observerBuilder.error(this.path, e);
            return false;
        }
    }

    /**
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        return this.model[key];
    }

    /**
     * sets value to schema key
     * @param {string|object} key
     * @param {any} value
     */
    set(key, value) {
        if (typeof key === "string") {
            _validPaths.get(this.jsd)[this.path] = -1;
            console.log(`this.model: ${this.model}`);
            this.model[key] = value;
            let valid = this.validate();
            if (typeof valid === "string") {
                this.observerBuilder.error(this.path, valid);
                return false;
            }
        } else {
            let e = ensureRequiredFields(this, key);
            _validPaths.get(this.jsd)[this.path] = e;
            if (typeof e === "string") {
                this.observerBuilder.error(this.path, e);
                return false;
            }
            Object.keys(key).forEach((_k) => {
                this.model[_k] = key[_k];
            });
        }
        if (this.isValid) {
            this.observerBuilder.next(this.path, this);
            return this;
        }
        let eMsg = this.validate();
        this.observerBuilder.error(this.path, eMsg);
        return false;
    }

    /**
     * indicates if Schema will accept arbitrary keys
     * @returns {boolean}
     */
    get isExtensible() {
        return _exists(this.signature.extensible) ?
            this.signature.extensible : this.options.extensible || false;
    }

    /**
     * get options (if any) for this model"s schema
     */
    get options() {
        return _schemaOptions.get(this);
    }

    /**
     * @returns list of required elements on this Schema
     */
    get requiredFields() {
        return _required_elements.get(this);
    }

    /**
     * sets default values for schema keys
     */
    setDefaults() {
        const _sig = this.schema;
        // attempts to set default value
        for (let _sigEl of Object.keys(_sig)) {
            // -- tests for element `default`
            let _default = _sig[_sigEl].default;
            if (_exists(_default)) {
                // sets default value for key on model
                this.set(_sigEl, _default);
            }
        }
    }

    static get defaultOptions() {
        return {
            extensible: false,
            debug: false,
        };
    }

    /**
     * base signature for all Schema Objects
     */
    static get defaultSignature() {
        return {
            type: "*",
            required: true,
            extensible: false
        };
    }
}
