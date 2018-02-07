import {
    _mdRef, _required_elements,
    _observers, _object, _kinds, _exists,
    _schemaHelpers, _schemaOptions, _schemaSignatures,
    _validPaths, wf
} from './_references';
import {MetaData} from './_metaData';
import {SchemaHelpers} from './_schemaHelpers';
import {SchemaValidator} from './_schemaValidator';
import {JSD} from './jsd';
import {Set} from './set';
/**
 * @class Schema
 */
export class Schema {
    /**
     * @constructor
     * @param {Object} _o - schema definition object
     * @param {Object} opts - schema options
     */
    constructor(_signature, opts = {extensible: false}) {
        var eMsg;
        if (!_exists(_signature)) {
            throw `Schema requires JSON object at arguments[0]. Got '${typeof _signature}'`;
        }
        _schemaOptions.set(this, opts);
        _required_elements.set(this, []);

        // tests for metadata
        if (!(this instanceof MetaData)) {
            let _;
            if (arguments[2] instanceof JSD) {
                _ = new MetaData(this, {
                    _path: "",
                    _root: this,
                    _jsd: arguments[2],
                });
            }
            else if (typeof arguments[2] == 'object') {
                if (arguments[2] instanceof MetaData) {
                    _ = arguments[2];
                } else {
                    _ = new MetaData(this, arguments[2]);
                }
            } else {
                throw `Invalid constructor call for Schema: ${JSON.stringify(arguments)}`
            }
            _mdRef.set(this, _);
        }

        if (_exists(_signature.polymorphic)) {
            _signature = _signature.polymorphic;
        }
        // traverses elements of schema checking for elements marked as reqiured
        if (_exists(_signature.elements)) {
            _signature = _signature.elements;
            for (let _sigEl of Object.keys(_signature)) {
                // -- tests for element `required`
                let _req = _signature[_sigEl].required;
                if (_req) {
                    // -- adds required element to list
                    let req = _required_elements.get(this);
                    req.push(_sigEl);
                    _required_elements.set(this, req);
                }
            }
        }

        // attempts to validate provided `schema` entries
        let _schema_validator = new SchemaValidator(_signature, Object.assign(this.options || {}, {
            jsd: _mdRef.get(this).jsd,
        }));
        // throws error if error message returned
        if (typeof (eMsg = _schema_validator.isValid()) === 'string') {
            throw eMsg;
        }
        _schemaSignatures.set(this, _signature);
        _schemaHelpers.set(this, new SchemaHelpers(this));
        _schemaHelpers.get(this).walkSchema(_signature || JSD.defaults, this.path);
        // creates model
        _object.set(this, new Proxy({}, this.handler));
        // attempts to set default value
        for (let _sigEl of Object.keys(_signature)) {
            // -- tests for element `default`
            let _default = _signature[_sigEl].default;
            if (_default) {
                // sets default value for key on model
                let _p = _sigEl.split('.');
                this.model[_sigEl] = _default;
            }
        }
    }

    get handler() {
        return {
            get: (t, key) => {
                const _m = t[key];
                return _m instanceof Schema ? _m.model : _m;
            },
            set: (t, key, value) => {
                let _sH = _schemaHelpers.get(this);
                if (typeof key === 'object') {
                    const e = _sH.setObject(key);
                    if (typeof e === 'string') {
                        this.jsd.observerBuilder.error(this.path, e);
                        return false;
                    }
                    return this.jsd.observerBuilder.next(this.path, this);
                }
                let _childSigs = this.signature.elements || this.signature;
                let _pathKeys = key.split(".");
                for (let _ in _pathKeys) {
                    let k = _pathKeys[_];
                    let _schema;
                    // derives path for element
                    let _key = this.path.length ? `${this.path}.${k}` : k;
                    if (_exists(_childSigs[`${k}`])) {
                        _schema = _childSigs[k];
                    }
                    else {
                        // attempts to find wildcard element name
                        if (_exists(_childSigs["*"])) {
                            // applies schema
                            _schema = _childSigs["*"].polymorphic || _childSigs["*"];
                            // creates Validator for path
                            this.jsd.validatorBuilder.create(_schema, _key, this);
                        }
                    }
                    // handles missing schema signatures
                    if (!_exists(_schema)) {
                        // rejects non-members of non-extensible schemas
                        if (!this.isExtensible) {
                            const e = `element '${_key}' is not a valid element`;
                            this.jsd.observerBuilder.error(key, e);
                            return false;
                        }
                        _schema = Schema.defaultSignature;
                    }
                    // handles child objects
                    if (typeof value === "object") {
                        value = _sH.setChildObject(_key, value);
                        if (typeof value === 'string') {
                            this.jsd.observerBuilder.error(_key, value);
                            this.jsd.observerBuilder.error(this.root.path, value);
                            return false;
                        }
                        // return;
                    }
                    // handles absolute values (strings, numbers, booleans...)
                    else {
                        this.subscribeTo(_key, {
                            error: (e) => {
                                let _p = Schema.concatPathAddr(this.path, _key);
                                this.jsd.observerBuilder.error(_p, e)
                            }
                        });
                        let eMsg = _sH.validate(_key, value);
                        _validPaths.get(this.jsd)[_key] = eMsg
                        if (typeof eMsg === "string") {
                            this.jsd.observerBuilder.error(_key, eMsg);
                            this.jsd.observerBuilder.error(this.path, eMsg);
                            this.jsd.observerBuilder.error(this.root.path, eMsg);
                            return eMsg
                        }
                    }
                    t[key] = value;
                }
                const _e = this.validate();
                if ((typeof _e) !== 'string') {
                    if (this.path.length) {
                        this.jsd.observerBuilder.next(this.path, value);
                    }
                    const _p = Schema.concatPathAddr(this.path, key);
                    const _j = this.root.toJSON();
                    this.jsd.observerBuilder.next(_p, _j);
                    return true;
                } else {
                    this.jsd.observerBuilder.error(this.path, _e);
                    return false;
                }
            }
        };
    }

    static concatPathAddr(path, addr) {
        return path.length ? `${path}.${addr}` : addr;
    }

    /**
     * @returns schema signature object
     */
    get signature() {
        return _schemaSignatures.get(this);
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
        if (typeof value === 'object') {
            this.subscribe({
                error: (e) => {
                    this.jsd.observerBuilder.error(this.path, e);
                }
            });

            const keys = Object.keys(value);

            if (keys.length) {
                keys.forEach((k) => {
                    this.model[k] = value[k];
                });
            } else {
                e = 'null not allowed';
                _validPaths.get(this.jsd)[this.path] = e;
                this.jsd.observerBuilder.error(this.path, e);
            }
            _validPaths.get(this.jsd)[this.path] = true;
            this.jsd.observerBuilder.next(this.path, this);
            this.unsubscribe();
        } else {
            e = `unable to set scalar value on model at ${this.path.length ? this.path : '.'}`;
            _validPaths.get(this.jsd)[this.path] = e;
            this.jsd.observerBuilder.error(this.path, e);
            return e;
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
        if (typeof key === 'string') {
            this.model[key] = value;
        } else {
            const _sH = _schemaHelpers.get(this);
            let e = _sH.ensureRequiredFields(key);
            _validPaths.get(this.jsd)[this.path] = e;
            if (typeof e === 'string') {
                this.jsd.observerBuilder.error(this.path, e);
            }
            Object.keys(key).forEach((_k) => {
                this.model[_k] = key[_k];
            });
        }
        return this;
    }


    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     */
    subscribe(func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribe requires function');
        }
        let _o = this.jsd.observerBuilder.get(this.path);
        if (!_o || _o === null) {
            this.jsd.observerBuilder.create(this.path, this);
            _o = this.jsd.observerBuilder.get(this.path);
        }

        _o.subscribe(func);
        return this;
    }

    /**
     * unsubscribes from this object's observer
     */
    unsubscribe() {
        let _o = this.jsd.observerBuilder.get(this.path);
        if (!_o || _o === null) {
            _o.unsubscribe();
        }
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     */
    subscribeTo(path, func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribeTo requires function');
        }
        let _o = this.jsd.observerBuilder.get(path);
        if (!_o || _o === null) {
            this.jsd.observerBuilder.create(path, this);
            _o = this.jsd.observerBuilder.get(path);
        }
        _o.subscribe(func);
        return this;
    }

    /**
     * unsubscribes from this observer for object at path
     * @param path
     */
    unsubscribeFrom(path) {
        let _o = this.jsd.observerBuilder.get(path);
        if (!_o || _o === null) {
            _o.unsubscribe();
        }
    }

    /**
     * @returns {true|string} returns error string or true
     */
    validate() {
        const paths = _validPaths.get(this.jsd);
        try {
            Object.keys(paths).forEach((k) => {
                if (typeof paths[k] === 'string') {
                    throw paths[k];
                }
            });
        } catch (e) {
            return e;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    get isValid() {
        return (typeof this.validate() !== 'string');
    }

    /**
     * gets raw value of this model
     */
    valueOf() {
        return this.model;
    }

    /**
     * JSONifies Schema Model
     */
    toJSON() {
        let _derive = (itm) => {
            if (itm instanceof Schema) {
                return itm.toJSON();
            }
            if (itm instanceof Set) {
                return itm.toJSON();
            }
            if (typeof itm === 'object') {
                const _o = !Array.isArray(itm) ? {} : [];
                for (let k in itm) {
                    _o[k] = _derive(itm[k]);
                }
                return _o;
            }
            return itm;
        };
        return _derive(this.valueOf());
    }

    /**
     * JSON stringifies primitive value
     */
    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
    }

    /**
     * get options (if any) for this model's schema
     */
    get options() {
        return _schemaOptions.get(this);
    }

    /**
     * @returns {string} Object ID for Schema
     */
    get objectID() {
        return _mdRef.get(this)._id;
    }

    /**
     * @returns {Schema} elemetn at Schema root
     */
    get root() {
        return _mdRef.get(this).root || this;
    }

    /**
     * @returns {string} path to current Schema
     */
    get path() {
        let _ = _mdRef.get(this).path;
        return _exists(_) ? _ : "";
    }

    /**
     * @returns {Schema} parent Schema element
     */
    get parent() {
        let _ = _mdRef.get(this).root;
        return _exists(_) ? _ : this;
    }

    /**
     * @returns {*|JSD}
     */
    get jsd() {
        return _mdRef.get(this).jsd;
    }

    /**
     * @returns list of required elements on this Schema
     */
    get requiredFields() {
        return _required_elements.get(this);
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
     * Base Signature for all Schema Objects
     */
    static defaultSignature() {
        return {
            type: "*",
            required: true,
            extensible: false
        };
    }
}
