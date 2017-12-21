import {_mdRef, _required_elements,
        _observers, _object, _kinds, _exists,
        _schemaHelpers, _schemaOptions, _schemaSignatures,
        _validators, wf} from './_references';
import {MetaData} from './_metaData';
import {ObserverBuilder} from './_observerBuilder';
import {SchemaHelpers} from './_schemaHelpers';
import {SchemaValidator} from './_schemaValidator';
import {ValidatorBuilder} from '././_validatorBuilder';
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
        _validators.set(this, {});
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
        }

        for (let _sigEl of Object.keys(_signature)) {
            // -- tests for element `required`
            let _req = _signature[_sigEl].required;
            if (_req) {
                // -- adds required element to list
                _required_elements.get(this).push(_sigEl);
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
        _schemaHelpers.get(this).walkSchema(_signature || {}, this.path);
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
                        ObserverBuilder.getInstance().error(key, e);
                        return false;
                    }
                    ObserverBuilder.getInstance().next(key, this);
                    return true;
                }
                console.log(`path: ${this.path} -- key: ${key}`);
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
                            ValidatorBuilder.getInstance().create(_schema, _key, this.jsd);
                        }
                    }
                    // handles missing schema signatures
                    if (!_exists(_schema)) {
                        // rejects non-members of non-extensible schemas
                        if (!this.isExtensible) {
                            const e = `element '${_key}' is not a valid element`;
                            ObserverBuilder.getInstance().error(key, e);
                            return false;
                        }
                        _schema = Schema.defaultSignature;
                    }
                    // handles child objects
                    if (typeof value === "object") {
                        // const tVal = value;
                        // const _valKeys = Object.keys(tVal);
                        console.log(`------\n${_key}\n${JSON.stringify(value)}\n------`);
                        if (typeof (value = _sH.setChildObject(_key, value)) === 'string') {
                            ObserverBuilder.getInstance().error(_key, value);
                            return false;
                        }
                        // return;
                    }
                    // handles absolute values (strings, numbers, booleans...)
                    else {
                        this.subscribeTo(_key, {
                            next: (value) => {
                                console.log(`calling subscribeTo::next for ${_key}`);
                                ObserverBuilder.getInstance().next(this.path, value);
                            },
                            error: (e) => {
                                console.log(`dispatch error for ${this.path}`);
                                ObserverBuilder.getInstance().error(this.path, e);
                            }
                        });
                        let eMsg = _sH.validate(_key, value);
                        if (typeof eMsg === "string") {
                            ObserverBuilder.getInstance().error(_key, eMsg);
                            ObserverBuilder.getInstance().error(this.path, eMsg);
                            return false;
                        }
                    }
                    t[key] = value;
                    ObserverBuilder.getInstance().next(Schema.concatPathAddr(this.path, _key), value);
                }
                let _e;
                if (typeof (_e = this.validate()) !== 'string') {
                    console.log(`\n${this.path} is valid\n`);
                    if (this.path.length) {
                        ObserverBuilder.getInstance().next(this.path, value);
                    }
                    ObserverBuilder.getInstance().next(this.path, this.root.toJSON());
                    return true;
                } else {
                    console.log(`\n'${this.path}' GOT ERROR\n${_e}`);
                    ObserverBuilder.getInstance().error(this.path, _e);
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
        if (typeof value === 'object') {
            Object.keys(value).forEach((k) => {
                this.model[k] = value[k];
            });
        }
        else {
            const e = `unable to set scalar value on model at ${this.path.length ? this.path : '.'}`;
            ObserverBuilder.getInstance().error(this.path, e);
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
            if (typeof e === 'string') {
                ObserverBuilder.getInstance().error(this.path, e);
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
        let _o = ObserverBuilder.getInstance().get(this.path);
        if (!_o || _o === null) {
            ObserverBuilder.getInstance().create(this.path, this);
            _o = ObserverBuilder.getInstance().get(this.path);
        }

        _o.subscribe(func);
        return this;
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
        let _o = ObserverBuilder.getInstance().get(path);
        if (!_o || _o === null) {
            ObserverBuilder.getInstance().create(path, this);
            _o = ObserverBuilder.getInstance().get(path);
        }
        _o.subscribe(func);
        return this;
    }

    /**
     * @returns {true|string} returns error string or true
     */
    validate() {
        const _sH = _schemaHelpers.get(this);
        const keys = Object.keys(this.signature);
        for (let _k of keys) {
            let e;
            let _path = this.path.length > 0 ? `${this.path}.${_k}` : _k;
            if (typeof (e = _sH.validate(_path)) === 'string') {
                return e;
            }
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    get isValid() {
        return (typeof this.validate() != 'string');
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
