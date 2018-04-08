import {
    _mdRef, _required_elements, _object, _exists, _schemaHelpers,
    _schemaOptions, _schemaSignatures, _validPaths
} from "./_references";
import {ensureRequiredFields} from "./utils";
import {MetaData} from "./_metaData";
import {SchemaHelpers} from "./_schemaHelpers";
import {SchemaValidator} from "./_schemaValidator";
import {JSD} from "./jsd";
import {Model} from "./model";

/**
 * @class Schema
 */
export class Schema extends Model {
    /**
     * @constructor
     * @param {Object} _o - schema definition object
     * @param {Object} opts - schema options
     */
    constructor(_signature = Schema.defaultSignature, opts = Schema.defaultOptions) {
        super();

        var eMsg;
        if (!_exists(_signature)) {
            throw `Schema requires JSON object at arguments[0]. Got '${typeof _signature}'`;
        }
        // freezes Options object to prevent modification
        _schemaOptions.set(this, Object.freeze(opts));
        _required_elements.set(this, []);

        // tests for metadata
        if (!(this instanceof MetaData)) {
            let _md;
            if (arguments[2] instanceof JSD) {
                _md = new MetaData(this, {
                    _path: "",
                    _root: this,
                    _writeLock: _signature.writeLock,
                    _jsd: arguments[2],
                });
            }
            else if (typeof arguments[2] == "object") {
                if (arguments[2] instanceof MetaData) {
                    _md = arguments[2];
                } else {
                    _md = new MetaData(this, arguments[2]);
                }
            } else {
                throw "Invalid attempt to construct Schema. tip: use `new JSD([schema])` instead"
            }
            // saves metadata object to global reference
            _mdRef.set(this, _md);
        }

        // traverses elements of schema checking for elements marked as reqiured
        if (_exists(_signature.elements)) {
            _signature = _signature.elements;
            for (let _sigEl of Object.keys(_signature)) {
                // -- tests for element `required`
                if (_signature[_sigEl].hasOwnProperty("required") &&
                    _signature[_sigEl].required === true) {
                    // -- adds required element to list
                    _required_elements.get(this).splice(-1, 0, _sigEl);
                }
            }
            // freezes req'd elements object to prevent modification
            _required_elements.set(this, Object.freeze(_required_elements.get(this)));
        }

        // attempts to validate provided `schema` entries
        let _sV = new SchemaValidator(_signature, Object.assign({}, this.options, {
            jsd: _mdRef.get(this).jsd,
        }));

        // throws error if error message returned
        if (typeof (eMsg = _sV.isValid) === "string") {
            throw eMsg;
        }

        // freezes schema signature to prevent modifications
        const _sig = Object.freeze(_signature || JSD.defaults);
        _schemaSignatures.set(this, JSON.stringify(_sig));
        _schemaHelpers.set(this, new SchemaHelpers(this));
        this.setDefaults();
    }

    /**
     * Handler for Object Proxy Evaluation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        return {
            get: (t, key) => {
                const _m = key === "$ref" ? this : t[key];
                return _m;
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

                let _childSigs = this.signature.elements || this.signature;
                let _pathKeys = key.split(".");
                let _pKRes = _sH.testPathkeys(t, _pathKeys, _childSigs, value);
                if (_pKRes) {
                    let kP = Schema.concatPathAddr(this.path, key);
                    _validPaths.get(this.jsd)[kP] = true;
                    // if ((typeof value) === "object") {
                    //     value = _sH.setChildObject(key, value);
                    //     if ((typeof value) === "string") {
                    //         this.observerBuilder.error(this.path, value);
                    //         return false;
                    //     }
                    // }
                    t[key] = value;
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
            _object.set(this, new Proxy(Model.createRef(this), this.handler));
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
                        // -- no-op
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
        let kPath = this.path;
        if (typeof key === "string") {
            _validPaths.get(this.jsd)[this.path] = -1;
            this.model[key] = value;
            let valid = this.validate();
            if (typeof valid === "string") {
                kPath = Schema.concatPathAddr(this.path, key);
                this.observerBuilder.error(this.path, valid);
                return false;
            }
        } else {
            const _sH = _schemaHelpers.get(this);
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
                let _p = _sigEl.split(".");
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
