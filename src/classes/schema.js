/**
 * @class Schema
 */
class Schema {
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
            // let _default = _signature[_sigEl].default;
            if (_req) {
                // -- adds required element to list
                _required_elements.get(this).push(_sigEl);
            }
        }
        // tests for metadata
        if (!(this instanceof _metaData)) {
            let _;
            if (!_exists(arguments[2])) {
                _ = new _metaData(this, {
                    _path: "",
                    _root: this
                });
            }
            else {
                _ = (arguments[2] instanceof _metaData) ? arguments[2] : new _metaData(this, arguments[2]);
            }
            _mdRef.set(this, _);
        }
        // attempts to validate provided `schema` entries
        let _schema_validator = new SchemaValidator(_signature, this.options);
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
                    return true;
                }
                let _childSigs = this.signature.elements || this.signature;
                let _pathKeys = key.split(".");
                for (let _ in _pathKeys) {
                    let k = _pathKeys[_];
                    let _schema;
                    // derives path for element
                    let _key = this.path.length > 0 ? `${this.path}.${k}` : k;
                    if (_exists(_childSigs[`${k}`])) {
                        _schema = _childSigs[k];
                    }
                    else {
                        // attempts to find wildcard element name
                        if (_exists(_childSigs["*"])) {
                            // applies schema
                            _schema = _childSigs["*"].polymorphic || _childSigs["*"];
                            // creates Validator for path
                            ValidatorBuilder.getInstance().create(_schema, _key);
                        }
                    }
                    // handles missing schema signatures
                    if (!_exists(_schema)) {
                        // rejects non-members of non-extensible schemas
                        if (!this.isExtensible) {
                            const e = `element '${_key}' is not a valid element`;
                            ObserverBuilder.getInstance().error(key, e);
                            return;
                        }
                        _schema = Schema.defaultSignature;
                    }
                    // handles child objects
                    if (typeof value === "object") {
                        const tVal = value;
                        const _valKeys = Object.keys(tVal);

                        if (typeof (value = _sH.setChildObject(_key, value)) === 'string') {
                            ObserverBuilder.getInstance().error(_key, value);
                            return;
                        }
                    }
                    // handles absolute values (strings, numbers, booleans...)
                    else {
                        this.subscribeTo(_key, {
                            next: (value) => {
                                ObserverBuilder.getInstance().next(this.path, value);
                            },
                            error: (e) => {
                                ObserverBuilder.getInstance().error(this.path, e);
                            }
                        });
                        let eMsg = _sH.validate(_key, value);
                        if (typeof eMsg === "string") {
                            ObserverBuilder.getInstance().error(_key, eMsg);
                            return;
                        }
                    }
                    t[key] = value;
                    ObserverBuilder.getInstance().next(key, value);
                }
            }
        };
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
        var _path = this.path;
        for (let _k of ValidatorBuilder.getInstance().list()) {
            let e;
            _path = _path.length > 0 ? `${_path}.${_k}` : _k;
            if (typeof (e = _validate(_k, this.root.get(_k))) === 'string') {
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
        let _ = _mdRef.get(this).root;
        return _exists(_) ? _ : this;
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
