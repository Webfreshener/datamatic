(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["JSD"] = factory();
	else
		root["JSD"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_wf_utils__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_wf_utils___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_wf_utils__);
/**
 * @private Weakmap Refs
 * @type {{wf: *, _kinds: WeakMap, _object: WeakMap, _mdRef: WeakMap, _required_elements: WeakMap, _validators: WeakMap, _singletons: WeakMap, _vectorTypes: WeakMap, _schemaOptions: WeakMap, _schemaHelpers: WeakMap, _schemaSignatures: WeakMap, _observers: WeakMap}}
 */

const _exists = __WEBPACK_IMPORTED_MODULE_0_wf_utils__["exists"];
/* harmony export (immutable) */ __webpack_exports__["a"] = _exists;

const wf = __WEBPACK_IMPORTED_MODULE_0_wf_utils__;
/* harmony export (immutable) */ __webpack_exports__["j"] = wf;

    // holds references to registered JS Objects
const _kinds = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["b"] = _kinds;

    // Schema and Set instance references
const _object = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["d"] = _object;

// MetaData references
const _mdRef = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["c"] = _mdRef;

// Lists of required elements for each Schema Node
const _required_elements = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["e"] = _required_elements;

// Schema Validators
const _validators = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["i"] = _validators;

// Singleton instance references
const _singletons = new WeakMap();
/* unused harmony export _singletons */

// Set element types
const _vectorTypes = new WeakMap();
/* unused harmony export _vectorTypes */

// Schema options refeerences
const _schemaOptions = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["g"] = _schemaOptions;

// Schema Helpers references
const _schemaHelpers = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["f"] = _schemaHelpers;

// Schema Signatures references
const _schemaSignatures = new WeakMap();
/* harmony export (immutable) */ __webpack_exports__["h"] = _schemaSignatures;

// RXJS Observer references
const _observers = new WeakMap();
/* unused harmony export _observers */




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__maps__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__schema__ = __webpack_require__(3);
/**
 * Strict JS Objects and Collections created from JSON Schema Definitions
 * @class JSD
 * @example const _jsd = new JSD();
 * _jsd.document = {name: 'test'};
 * console.log(`${jsd.document.name}`);
 * // -> 'test'
 * console.log(`${jsd.document.get('.'}`);
 * // -> Schema
 */




const _documents = new WeakMap();
class JSD {
    /**
     * @constructor
     * @param schema
     * @param options
     */
    constructor(schema = JSD.defaults, options) {
        __WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].set(this, {
            "Array": Array,
            "ArrayBuffer": ArrayBuffer,
            "Boolean": Boolean,
            "Buffer": ArrayBuffer,
            "Date": Date,
            "Number": Number,
            "Object": Object,
            "String": String,
            "Function": Function
        });
        _documents.set(this, new __WEBPACK_IMPORTED_MODULE_1__schema__["a" /* Schema */](schema, options));
    }

    /**
     *
     * @returns {*}
     */
    get document() {
        return _documents.get(this);
    }

    /**
     *
     * @param value
     */
    set document(value) {
        // let _m = _docs.get(this);
        this.document = value;
    }

    /**
     * @param {string|function} classesOrNames
     * @returns {function}
     */
    static getClass(classesOrNames) {
        let _k = __WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].get(this);
        if (!Array.isArray(classesOrNames)) {
            classesOrNames = [classesOrNames];
        }
        // traverses arguemtns
        for (let arg of classesOrNames) {
            if (typeof arg === "string") {
                return (0 <= Object.keys(_k).indexOf(arg)) ? arg.toLowerCase() : null;
            }
            // operates on object
            if (typeof arg === "object") {
                //- operates on arrays
                if (Array.isArray(arg)) {
                    //- holds the results set
                    let _r = [];
                    // traverses array elements
                    for (let n of arg) {
                        //- tests elements
                        switch (typeof n) {
                            //- operates on string
                            case "string":
                                // sets reference onto results
                                _r.push(this.getClass(n));
                                break;
                            //-- operates on functions/classes
                            case "function":
                                //- sets function/class on results
                                _r.push(n);
                                break;
                            default:
                                //- handles nested arrays
                                _r.push(Array.isArray(n) ? this.getClass.apply(this, n) : null);
                        }
                    } //- end for/switch
                    return (0 <= _r.indexOf(null)) ? {_r: null} : undefined;
                } //- ends array handling
                return null;
            } //- end typrof arg is object
            if (typeof arg === "function") {
                let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Fun.getConstructorName(arg);
                return this.getClass(_);
            }
        } //- end args in classesOrNames
        return null;
    }

    /**
     * @param {string} name
     * @param {function} clazz
     */
    registerClass(name, clazz) {
        this[name] = clazz;
        return __WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].get(this)[name] = clazz;
    }

    /**
     * @param {string} name
     */
    unregisterClass(name) {
        if (__WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].hasOwnProperty(name)) {
            return delete __WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].get(this)[name];
        }
        return false
    }

    /**
     * @return list of registered Class Names
     */
    listClasses() {
        return Object.keys(__WEBPACK_IMPORTED_MODULE_0__maps__["b" /* _kinds */].get(this));
    }

    /**
     * creates new Schema from JSON data
     * @param {string|object} json
     * @returns Schema
     */
    fromJSON(json) {
        let _;
        if (_ = (typeof json).match(/^(string|object)+$/)) {
            return new __WEBPACK_IMPORTED_MODULE_1__schema__["a" /* Schema */]((_[1] === "string") ? JSON.parse(json) : json);
        }
        throw new Error("json must be either JSON formatted string or object");
    }

    /**
     * @returns {object} base schema element signature
     */
    get schemaRef() {
        return {
            type: {
                type: this.listClasses(),
                required: true
            },
            required: "Boolean",
            extensible: "Boolean",
            restrict: "String",
            default: "*",
            elements: ["Object", "Array"],
            polymorphic: {
                type: ["Object", "Array"],
                required: false,
                elements: {
                    type: {
                        type: this.listClasses(),
                        required: true
                    },
                    extensible: "Boolean",
                    restrict: "String",
                    validate: "Function",
                    default: "*",
                    elements: ["Object", "Array"]
                }
            }
        };
    }

    /**
     * @getter
     * @returns {object} base schema element settings
     * @example let schema = Object.assign({}, {extensible: true}, JSD.defaults);
     * console.log( JSON.stringify( schema ) );
     * // -> `{ "myElement": { "type": "*", "required": false, "extensible": true } }`
     *
     */
    static get defaults() {
        return {
            type: "*",
            required: false,
            extensible: false
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = JSD;



/***/ }),
/* 2 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__maps__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__metaData__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__observerBuilder__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__schemaHelpers__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__schemaValidator__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__validatorBuilder__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__jsd__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__set__ = __webpack_require__(13);








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
        if (!Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_signature)) {
            throw `Schema requires JSON object at arguments[0]. Got '${typeof _signature}'`;
        }
        __WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].set(this, opts);
        __WEBPACK_IMPORTED_MODULE_0__maps__["i" /* _validators */].set(this, {});
        __WEBPACK_IMPORTED_MODULE_0__maps__["e" /* _required_elements */].set(this, []);
        if (Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_signature.polymorphic)) {
            _signature = _signature.polymorphic;
        }
        // traverses elements of schema checking for elements marked as reqiured
        if (Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_signature.elements)) {
            _signature = _signature.elements;
        }

        for (let _sigEl of Object.keys(_signature)) {
            // -- tests for element `required`
            let _req = _signature[_sigEl].required;
            // let _default = _signature[_sigEl].default;
            if (_req) {
                // -- adds required element to list
                __WEBPACK_IMPORTED_MODULE_0__maps__["e" /* _required_elements */].get(this).push(_sigEl);
            }
        }
        // tests for metadata
        if (!(this instanceof __WEBPACK_IMPORTED_MODULE_1__metaData__["a" /* MetaData */])) {
            let _;
            if (arguments[2] instanceof __WEBPACK_IMPORTED_MODULE_6__jsd__["a" /* JSD */]) {
                _ = new __WEBPACK_IMPORTED_MODULE_1__metaData__["a" /* MetaData */](this, {
                    _path: "",
                    _root: this,
                    _jsd: arguments[2],
                });
            }
            else {
                _ = (arguments[2] instanceof __WEBPACK_IMPORTED_MODULE_1__metaData__["a" /* MetaData */]) ? arguments[2] : new __WEBPACK_IMPORTED_MODULE_1__metaData__["a" /* MetaData */](this, arguments[2]);
            }
            __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].set(this, _);
        }
        // attempts to validate provided `schema` entries
        let _schema_validator = new __WEBPACK_IMPORTED_MODULE_4__schemaValidator__["a" /* SchemaValidator */](_signature, this.options);
        // throws error if error message returned
        if (typeof (eMsg = _schema_validator.isValid()) === 'string') {
            throw eMsg;
        }
        __WEBPACK_IMPORTED_MODULE_0__maps__["h" /* _schemaSignatures */].set(this, _signature);
        __WEBPACK_IMPORTED_MODULE_0__maps__["f" /* _schemaHelpers */].set(this, new __WEBPACK_IMPORTED_MODULE_3__schemaHelpers__["a" /* SchemaHelpers */](this));
        __WEBPACK_IMPORTED_MODULE_0__maps__["f" /* _schemaHelpers */].get(this).walkSchema(_signature || {}, this.path);
        // creates model
        __WEBPACK_IMPORTED_MODULE_0__maps__["d" /* _object */].set(this, new Proxy({}, this.handler));
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
                let _sH = __WEBPACK_IMPORTED_MODULE_0__maps__["f" /* _schemaHelpers */].get(this);
                if (typeof key === 'object') {
                    const e = _sH.setObject(key);
                    if (typeof e === 'string') {
                        __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(key, e);
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
                    if (Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_childSigs[`${k}`])) {
                        _schema = _childSigs[k];
                    }
                    else {
                        // attempts to find wildcard element name
                        if (Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_childSigs["*"])) {
                            // applies schema
                            _schema = _childSigs["*"].polymorphic || _childSigs["*"];
                            // creates Validator for path
                            __WEBPACK_IMPORTED_MODULE_5__validatorBuilder__["a" /* ValidatorBuilder */].getInstance().create(_schema, _key);
                        }
                    }
                    // handles missing schema signatures
                    if (!Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_schema)) {
                        // rejects non-members of non-extensible schemas
                        if (!this.isExtensible) {
                            const e = `element '${_key}' is not a valid element`;
                            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(key, e);
                            return;
                        }
                        _schema = Schema.defaultSignature;
                    }
                    // handles child objects
                    if (typeof value === "object") {
                        const tVal = value;
                        const _valKeys = Object.keys(tVal);

                        if (typeof (value = _sH.setChildObject(_key, value)) === 'string') {
                            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(_key, value);
                            return;
                        }
                    }
                    // handles absolute values (strings, numbers, booleans...)
                    else {
                        this.subscribeTo(_key, {
                            next: (value) => {
                                __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().next(this.path, value);
                            },
                            error: (e) => {
                                __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, e);
                            }
                        });
                        let eMsg = _sH.validate(_key, value);
                        if (typeof eMsg === "string") {
                            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(_key, eMsg);
                            return;
                        }
                    }
                    t[key] = value;
                    __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().next(key, value);
                }
            }
        };
    }

    /**
     * @returns schema signature object
     */
    get signature() {
        return __WEBPACK_IMPORTED_MODULE_0__maps__["h" /* _schemaSignatures */].get(this);
    }

    /**
     * getter for object model
     */
    get model() {
        return __WEBPACK_IMPORTED_MODULE_0__maps__["d" /* _object */].get(this);
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
            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, e);
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
            const _sH = __WEBPACK_IMPORTED_MODULE_0__maps__["f" /* _schemaHelpers */].get(this);
            let e = _sH.ensureRequiredFields(key);
            if (typeof e === 'string') {
                __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, e);
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
        let _o = __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(this.path);
        if (!_o || _o === null) {
            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().create(this.path, this);
            _o = __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(this.path);
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
        let _o = __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(path);
        if (!_o || _o === null) {
            __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().create(path, this);
            _o = __WEBPACK_IMPORTED_MODULE_2__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(path);
        }

        _o.subscribe(func);
        return this;
    }

    /**
     * @returns {true|string} returns error string or true
     */
    validate() {
        var _path = this.path;
        for (let _k of __WEBPACK_IMPORTED_MODULE_5__validatorBuilder__["a" /* ValidatorBuilder */].getInstance().list()) {
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
            if (itm instanceof __WEBPACK_IMPORTED_MODULE_7__set__["a" /* Set */]) {
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
        return __WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].get(this);
    }

    /**
     * @returns {string} Object ID for Schema
     */
    get objectID() {
        return __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].get(this)._id;
    }

    /**
     * @returns {Schema} elemetn at Schema root
     */
    get root() {
        let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].get(this).root;
        return Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_) ? _ : this;
    }

    /**
     * @returns {string} path to current Schema
     */
    get path() {
        let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].get(this).path;
        return Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_) ? _ : "";
    }

    /**
     * @returns {Schema} parent Schema element
     */
    get parent() {
        let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].get(this).root;
        return Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(_) ? _ : this;
    }

    /**
     * @returns list of required elements on this Schema
     */
    get requiredFields() {
        return __WEBPACK_IMPORTED_MODULE_0__maps__["e" /* _required_elements */].get(this);
    }

    /**
     * indicates if Schema will accept arbitrary keys
     * @returns {boolean}
     */
    get isExtensible() {
        return Object(__WEBPACK_IMPORTED_MODULE_0__maps__["a" /* _exists */])(this.signature.extensible) ?
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
/* harmony export (immutable) */ __webpack_exports__["a"] = Schema;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__maps__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__schema__ = __webpack_require__(3);


/**
 * @private
 */
class MetaData {
    /**
     * @constructor
     * @param {Schema|Set} _oRef -- Object Reference to item being described
     * @param {object} _data -- Initial Data {parent:Schema|Set}
     */
    constructor(_oRef, _data = {}) {
        let _cName = __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Fun.getConstructorName(_oRef);
        if (!(_oRef instanceof __WEBPACK_IMPORTED_MODULE_1__schema__["a" /* Schema */] || _oRef instanceof Set)) {
            throw `new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<${_cName}>'`;
        }
        if (this._createID == null) {
            let _id = 0;
            MetaData.prototype._createID = function () {
                if (this.__objID == null) {
                    _id = _id + 1;
                    this.__objID = `${_cName}${_id}`;
                }
                return this.__objID;
            };
        }
        _data = Object.assign(_data, {
            _id: this._createID(),
            _className: _cName,
            _created: Date.now()
        });
        __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].set(this, _data);
        __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].set(_oRef, _data);
    }

    /**
     * @param {string} key
     */
    get(key) {
        let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["c" /* _mdRef */].get(this);
        return _.hasOwnProperty(key) ? _[key] : null;
    }

    /**
     * not implemented
     */
    set() {
        return this;
    }

    /**
     * UUID of element
     * @returns {string} Unique ObjectID
     */
    get objectID() {
        return this.get('_id');
    }

    /**
     * Root Schema element
     * @returns {Schema|Set}
     */
    get root() {
        return this.get('_root');
    }

    /**
     * Path to element
     * @returns {string}
     */
    get path() {
        return this.get('_path');
    }

    /**
     * Owner JSD document
     * @returns {JSD}
     */
    get jsd() {
        return this.get('_jsd');
    }

    /**
     * @returns {string} path to Element
     */
    get parent() {
        let _ = this.path || "";
        var _p = _.split('.');
        _p = (_p.length > 1) ? _p.slice(0, _p.length - 2).join('.') : _p[0];
        return (_p.length > 0) ? this.root.get(_p) : this.root;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MetaData;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Created by van on 10/9/17.
 */
let __oBuilder = null;
class ObserverBuilder {
    /**
     * @constructor
     */
    constructor() {
        if (!_exists(__oBuilder)) {
            _observers.set((__oBuilder = this), {});
        }
        return __oBuilder;
    }

    /**
     * @returns list of validation paths
     */
    list() {
        let _v = _observers.get(this);
        return object.keys(_v);
    }

    /**
     * @param path
     * @returns item at path reference
     */
    get(path) {
        let _o = _observers.get(this);
        return _exists(_o[path]) ? _o[path] : null;
    }

    create(forPath, oRef) {
        if (!(oRef instanceof Schema || oRef instanceof Set)) {
            throw 'oRef must be instance of Schema or Set';
        }
        let _o = _observers.get(this);
        _o[forPath] = new Rx.Subject();
    }

    next(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.next(value);
        }
    }

    complete(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.complete(value);
        }
    }

    error(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.error(value);
        }
    }

    /**
     * @returns singleton ObserverBuilder reference
     */
    static getInstance() {
        return new this;
    }

    /**
     * @returns validators WeakMap
     */
    static getObservers() {
        return _observers.get( ObserverBuilder.getInstance() );
    }
    /**
     *
     */
    static create(path, oRef) {
        return ObserverBuilder.getInstance().create(path, oRef);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ObserverBuilder;



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__validators__ = __webpack_require__(12);

/**
 * @private
 */
let __vBuilder = null;
/**
 * @private
 */
class ValidatorBuilder {
    /**
     * @constructor
     */
    constructor() {
        if (!_exists(__vBuilder)) {
            _validators.set((__vBuilder = this), {});
        }
        return __vBuilder;
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
     * @param _path
     * @param func
     */
    set(_path, func) {
        if (!_exists(func) || typeof func !== 'function') {
            return "2nd argument expects a function";
        }
        _validators.get(this)[_path] = func;
        return this;
    }

    /**
     * @param {object} _ref
     * @param {string} _path
     */
    create(ref, path) {
        if (!_exists(ref)) {
            throw "create requires object reference at arguments[0]";
        }
        let _signatures = _exists(ref.polymorphic) ?
            ref.polymorphic : (
                Array.isArray(ref) ? ref : [ref]
            );
        let _v = _validators.get(this);
        let _functs = _signatures.map(_sig => {
            if (typeof _sig !== 'object') {
                return new __WEBPACK_IMPORTED_MODULE_0__validators__["a" /* Validator */]["Default"](path, _sig);
            }
            if (_sig.hasOwnProperty('*')) {
                this.create(_sig['*'], path);
                delete _sig['*'];
                if (Object.keys(_sig) > 0) {
                    return this.create(_sig, path);
                }
                return;
            }

            let _typeof = global.wf.Str.capitalize(_sig.type);
            let _hasKey = (0 <= Object.keys(__WEBPACK_IMPORTED_MODULE_0__validators__["a" /* Validator */]).indexOf(_typeof));
            // ObserverBuilder.getInstance().create(path, ref);
            return new __WEBPACK_IMPORTED_MODULE_0__validators__["a" /* Validator */][_hasKey ? _typeof : "Default"](path, _sig);
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
        let _v = ValidatorBuilder.getValidators();
        if (!_v.hasOwnProperty(path)) {
            return `validator for '${path}' does not exist`;
        }
        return _v[path](value);
    }

    /**
     * @returns singleton ValidatorBuilder reference
     */
    static getInstance() {
        return new this;
    }

    /**
     * @returns validators WeakMap
     */
    static getValidators() {
        return _validators.get(ValidatorBuilder.getInstance());
    }

    /**
     *
     */
    static create(signature, path) {
        ValidatorBuilder.getInstance().create(signature, path);
    }

    /**
     *
     */
    static getPolymorphic(signature, path) {
        let _attr = path.split(".").pop();
        // tests for element as child element on polymorphic object signature
        if (_exists(signature.elements[_attr])) {
            ValidatorBuilder.create(signature.elements[_attr], path);
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ValidatorBuilder;


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2)))

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_jsd__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "JSD", function() { return __WEBPACK_IMPORTED_MODULE_0__classes_jsd__["a"]; });
/////////////////////////////////////////////////
// JSD
// (c)2015-2017 Van Schroeder <van@webfreshener.com>
/////////////////////////////////////////////////
//== Polyfills Object.assign
if (typeof Object.assign != "function") {
    Object.assign = function (target) {
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        target = Object(target);
        let index = 1;
        while (index < arguments.length) {
            let source = arguments[index];
            if (source !== null) {
                for (let key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            index = index + 1;
        }
        return target;
    }
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(9);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["wfUtils"] = factory();
	else
		root["wfUtils"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	const _o = {};
	_o.Fun = __webpack_require__(1);
	_o.Obj = __webpack_require__(2);
	_o.Str = __webpack_require__(3);
	_o.exists = function(value) {
	    return typeof value !== 'undefined' && value !== null;
	};
	// function exists(value) {
	//     return typeof value !== 'undefined' && value !== null;
	// };
	module.exports = _o;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	const Fun = {};
	/**
	 * Returns name of provided function
	 * @param fun
	 * @returns {*}
	 */
	Fun.getFunctionName = function(fun){
	  let n;
	  if ((n = fun.toString().match(/function+\s{1,}([a-zA-Z_0-9\$]*)/)) != null) { return n[1]; } else { return null; }
	};
	/**
	 * Attempts to safely determine name of the Class Constructor returns null if undefined
	 * @param fun
	 * @returns {*}
	 */
	Fun.getConstructorName = function(fun){
	  let _;
	  if (fun.constructor.name === "Function") {
	    fun = new fun();
	  }
	  if ((_ = this.getFunctionName(fun.constructor)) !== null) {
	    return _;
	  } else {
	    return null; }
	};
	/**
	 * Invokes a Constructor with optional arguments array
	 * @param constructor
	 * @param args
	 */
	Fun.construct = (constructor, args)=> new ( constructor.bind.apply(constructor, [null].concat(args)) );
	/**
	 * returns an arbitrary Function from array
	 * @type {()}
	 */
	Fun.factory = Fun.construct.bind(null, Function);
	/**
	 * creates function from string (simple functions only -- does not support nesting)
	 * @param string
	 * @returns {*}
	 */
	Fun.fromString = function(string){
	  var m = string.replace(/\n/g,'').replace(/[\s]{2,}/g, '');
	  if ((m.match(/^function+[\s]{1,}[a-zA-Z0-9_]*\(([a-zA-Z0-9_\s,]*)\)+\s?\{+(.*)\}+$/) ) !== null) {
	    return Fun.factory([].concat(m[1], m[2]));
	  }
	  let _ =  string.match(new RegExp(`^Native::(${( Object.keys(this.natives) ).join('|')})+$`));
	  return _ !== null ? this.natives[_[1]] : null;
	};
	/**
	 * Converts function to string, using encoding to handle native objects
	 * (Simple functions only. Does not support nesting)
	 * @param fun
	 * @returns {*}
	 */
	Fun.toString = function(fun){
	  let s;
	  if (typeof fun !== 'function') { return fun; }
	  if (((s = fun.toString()).match(/.*\[native code\].*/)) != null) {
	    return `Native::${this.getFunctionName(fun)}`;
	  } else {
	    return s; }
	}
	/**
	 *
	 * @type {{Array: Array, ArrayBuffer: ArrayBuffer, Boolean: Boolean, Buffer: ArrayBuffer, Date: Date, Number: Number, Object: Object, String: String, Function: *}}
	 */
	Fun.natives = {
	  Array,
	  ArrayBuffer,
	  Boolean,
	  Buffer:ArrayBuffer,
	  Date,
	  Number,
	  Object,
	  String,
	  Function
	};

	module.exports = Fun;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	const Fun = __webpack_require__(1);
	const Obj = {};
	/**
	 * returns  name of Object type as string
	 * @param obj
	 */
	Obj.getTypeOf = obj=> Object.prototype.toString.call(obj).slice(8, -1);
	/**
	 * returns `boolean` based on object passed as object param matching  object passed as kind param
	 * @param value
	 * @param kind
	 * @returns {boolean}
	 */
	Obj.isOfType = function(value, kind){
	  return (this.getTypeOf(value)) === (Fun.getFunctionName(kind)) || value instanceof kind;
	};
	/**
	 * Transforms Object to name value paired Query String
	 * @param object
	 * @returns {string}
	 */
	Obj.objectToQuery = function(object={}){
	  let pairs = [];
	  let keys  = Object.keys(object);
	  for (let i of __range__(0, (keys.length - 1), true)) {
	    pairs[i] = [keys[i], object[keys[i]]];
	  }
	  return (pairs.map((v,k) => v.join('=')) ).join('&');
	};
	/**
	 * Transforms name value paired Query String to Object
	 * @param string
	 * @returns {{}}
	 */
	Obj.queryToObject = function(string){
	  let o={};
	  decodeURIComponent(string).replace('?','').split('&').forEach((v,k)=> { let p;
	  if ((p = v.split('=')).length === 2) { return o[p[0]] = p[1]; } });
	  return o;
	};
	function __range__(left, right, inclusive) {
	  let range = [];
	  let ascending = left < right;
	  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
	  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
	    range.push(i);
	  }
	  return range;
	}

	module.exports = Obj;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	const Str = {};

	/**
	 * @param string
	 * @returns capitalized string
	 */
	Str.capitalize = function(string){
	  if (string === null) { return ""; }
	  if (typeof string !== 'string') { string = string.toString(); }
	  return string.split(/[\s]{1,}/).map((_)=>{
	    return `${_.charAt(0).toUpperCase()}${_.slice(1)}`;
	  }).join(" ");
	};
	/**
	 *
	 * @param string
	 * @returns strng with null chars removed
	 */
	Str.stripNull = function(string){
	  if (typeof string === 'undefined') { return ''; }
	  return string.replace(/\0/g, '');
	};

	module.exports = Str;

/***/ })
/******/ ])
});
;

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @private
 */
class SchemaHelpers {
    /**
     * @constructor
     */
    constructor(_ref) {
        if (!_exists(_ref) || !(_ref instanceof Schema)) {
            throw new Error("arguments[0] must be type 'Schema'");
        }
        this._ref = _ref;
    }

    /**
     *
     */
    setObject(obj) {
        obj = this.ensureRequiredFields(obj);
        if (typeof obj === 'string') {
            return obj;
        }
        // calls set with nested key value pair
        for (var k in obj) {
            let eMsg = this._ref.model[k] = obj[k];
            if (typeof eMsg === 'string') {
                throw new Error( eMsg );
            }
        }
        return this._ref;
    }

    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    setChildObject(key, value) {
        let _mdData = {
            _path: key,
            _root: this._ref.root
        };
        let _s = this.createSchemaChild(key, value, this._ref.options, _mdData);
        if (!_exists(_s) || typeof _s !== "object") {
            return `'${key}' was invalid`;
        }

        if (_s instanceof Set) {
            return _s.model = value;
        }
        return _s.set(value);
    }

    /**
     * @param {Object} itm
     * @returns {String|Boolean}
     */
    ensureKindIsString(itm) {
        switch (typeof itm) {
            case 'string':
                return itm;
            case 'object':
                if (itm.hasOwnProperty('type')) {
                    return this.ensureKindIsString(itm.type);
                }
                break;
        }
        return false;
    }

    /**
     * tests if required fields exist on object
     * @param {Object} obj
     * @returns {true|string} - returns true or error string
     */
    ensureRequiredFields(obj) {
        let oKeys = Object.keys(obj);
        let _required = this._ref.requiredFields;
        for (let _ in _required) {
            let _key = _required[_];
            let _path = this._ref.path.length ? this._ref.path : "root element";
            if (0 > oKeys.indexOf(_key)) {
                if (_exists(this._ref.signature[_key].default)) {
                    obj[_key] = this._ref.signature[_key].default;
                } else {
                    return `required property '${_key}' is missing for '${_path}'`;
                }
            }
        }
        return obj;
    }

    /**
     * @param {Object} value
     * @param {MetaData} metaData
     */
    createSchemaChild(key, value, opts, metaData) {
        var _kinds;
        // tests if value is not Array
        if (!Array.isArray(value)) {
            let _md = new MetaData(this._ref, metaData || {
                    _path: key,//`${this._ref.path}.${key}`,
                    _root: this._ref.root
                });
            // _kinds = this.getKinds(this._ref.signature[key] || this._ref.signature);
            let _schemaDef = this._ref.signature[key.split(".").pop()] ||
                this._ref.signature['*'] ||
                this._ref.signature;
            try {
                var _s = new Schema(_schemaDef, opts, _md);
            } catch (e) {
                return e;
            }
            return _s;
        }
        else {
            _kinds = this.getKinds(this._ref.signature[key] || this._ref.signature);
            if (Array.isArray(_kinds)) {
                _kinds = _kinds.map((val) => this.ensureKindIsString(val));
                _kinds = _kinds.filter(itm => itm !== false);
                _kinds = _kinds.length ? _kinds : '*';
                return new Set((_kinds || '*'), metaData);
            }
        }
        return "unable to process value";
    }

    /**
     * builds validations from SCHEMA ENTRIES
     * @private
     */
    walkSchema(obj, path) {
        let result = [];
        let _map = function (itm, objPath) {
            return _walkSchema(itm, objPath);
        };
        let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
        for (let _i in _elements) {
            let _k = _elements[_i];
            let itm;
            let objPath = _exists(path) ? (path.length ? `${path}.${_k}` : _k) : _k || "";
            ValidatorBuilder.getInstance().create(obj[_k], objPath);
            // tests for nested elements
            if (_exists(obj[_k]) && typeof obj[_k].elements === "object") {

                if (!Array.isArray(obj[_k].elements)) {
                    result.push(this.walkSchema(obj[_k].elements, objPath));
                }
                else {
                    result.push(_map(obj[_k].elements, objPath));
                }
            }
        }

        return result;
    }

    /**
     * @private
     */
    objHelper(_schema, opts) {
        var _kinds = this.getKinds(_schema);
        if (Array.isArray(_kinds)) {
            _kinds = _kinds.map(function (itm) {
                switch (typeof itm) {
                    case "string":
                        return itm;
                        break;
                    case "object":
                        if (itm.hasOwnProperty('type')) {
                            return itm.type;
                        }
                        break;
                }
                return null;
            });
            _kinds = _kinds.filter(itm => _exists(itm));
            _kinds = _kinds.length ? _kinds : '*';
            return new Set(_kinds || '*');
        }
        return null;
    }

    /**
     * @param {string} key
     * @param {object} object to validate
     */
    validate(key, value) {
        var _list = ValidatorBuilder.getInstance().list();
        var _ref;
        //-- attempts to validate
        if (!key.length) { // and @ instanceof MetaData
            return `invalid path '${key}'`;
        }
        // key = if value instanceof MetaData then value.get( '_path' ) else value.getpath
        // return "object provided was not a valid subclass of Schema" unless value instanceof Schema
        // return "object provided was malformed" unless typeof (key = value.getPath?()) is 'string'
        let msg;
        if (0 <= _list.indexOf(key)) {
            let _path = [];
            let iterable = key.split('.');
            var _p;
            for (let _k of iterable) {
                _path.push(_k);
                _p = _path.join('.');
            }
            if (!(_ref = ValidatorBuilder.getInstance().get(_p))) {
                if (!this.options.extensible) {
                    return `'${key}' is not a valid schema property`;
                }
            }
            ValidatorBuilder.getInstance().set(key, _ref);
        }
        if (typeof (msg = ValidatorBuilder.getInstance().exec(key, value)) === 'string') {
            return msg;
        }
        return true;
    }

    /**
     * @returns {array} list of types decalred by object
     */
    getKinds(_s) {
        var _elems = Object.keys(_s).map(key => {
            return (key === "type") ? _s.type : _exists(_s[key].type) ? _s[key].type : null;
        });
        _elems = _elems.filter(elem => elem !== null);
        return _elems.length ? _elems : null;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SchemaHelpers;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__maps__ = __webpack_require__(0);

/**
 * @private
 * @class
 */
class SchemaValidator {
	/**
	 * @constructor
	 * @param {object} schema
	 * @param {object} options
	 */
	constructor(_schema = {}, opts={extensible:false}) {
		__WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].set(this, opts);
		var _errorMsg = null;
		this.isValid = () => _errorMsg || true;
		// validates SCHEMA ENTRIES
		let _iterate = Array.isArray(_schema) ? _schema : Object.keys(_schema);
		for (let _oKey of _iterate) {
	    	switch (typeof _schema[_oKey]) {
	        	case "string":
	        		let obj = {};
	        		obj[_oKey] = {
	        			type: __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Str.capitalize( _schema[_oKey] ),
	        			required: false
	        			};
	        		let _o = Object.assign( _schema, obj );
	        		_errorMsg = this.validateSchemaEntry( _oKey, _schema[_oKey] );
	        		break;
	        	case "object":
	        		if (!Array.isArray(_schema[_oKey])) {
	        			if (_oKey !== "elements") {
	        				_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);	}
	        			else {
	        				for (let _x of Object.keys(_schema[_oKey])) {
	        					if (typeof (_errorMsg = this.validateSchemaEntry(_x, _schema[_oKey][_x])) === "string") {
	        						return _errorMsg;	}
	        				}	}	}
	        		else {
	        			for (let _s of _schema[_oKey]) {
	        				if (typeof _schema[_oKey][_s] === "string") {
	        					_errorMsg = this.validateTypeString(_oKey, _schema[_oKey][_s]);	} 
	        				else {
	        					_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey][_s]);	}	
	        				}	}
	        		break;
	        	case "boolean":
	        		_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
	        		break;
	        	default:
	        		_errorMsg = `value for schema element '${_oKey}' was invalid`;	}
	    	}
		}
	/**
	 *  @param {string} key
	 *  @param {string} _type
	 */
	validateTypeString(key, _type) {
		//- ignores special `default` object key
		if (key.match(/\.?default+$/)) { 
			return true; }
		//- hanbdles restrictions defined in `restrict` object key
		if (key.match(/\.?restrict+$/)) {
			if (typeof _type !== "string" || !_type.length) {
				return "restrict requires a Regular Expression String"; }
			try {
				//- tests for valid RegExp string
				"text".match( new RegExp(_type) ); }
			catch (e) {
				return `Regular Expression provided for '${key}' was invalid. ${e}`;	}	}
		//- tests for basic string type declaration {key: {type: "String"} }
		else {
			if (!_exists( _jsd_.getClass( __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Str.capitalize(_type)) )) {
				return `type '<${_type}>' for schema element '${key}' was invalid`; }	}
		return true;
		}
	/**
	 * @param {string} key
	 * @param {object{ params
	 */
	validateUntypedMembers(key, params) {
		if (Array.isArray(params)) {
			for (let item of params) {
				var _res;
				if (typeof (_res = this.validateSchemaEntry(key, item)) === "string") {
					return _res; }	}	
			}
		else {
			let _p;
			let keyPath;
			if ((_p = (keyPath = key.split(".")).pop()) !== "elements") { 
				if (_p === "default") {
					return true;
				}
				if (params.hasOwnProperty("polymorphic")) {
					return this.validateSchemaEntry(key, params.polymorphic);	}
				return `value for schema element '${key}' was malformed. Property 'type' was missing`;	} 
			else {
				for (let param of Object.keys( params )) {
					var _res;
					let _keys = [].concat( keyPath ).concat(param);
					if (typeof (_res = this.validateSchemaEntry(`${_keys.join(".")}`, params[param])) === "string") { 
						return _res;	}	}	}
	      	}
	    return true;
	    }
	/**
	 * @param {string} key
	 * @param {object{ params
	 */
	validateSchemaClass(key, params) {
		if (!_exists( key )) {
			throw "key was undefined"; }
		if (typeof key !== "string") {
			throw `string expected for argument 'key'. Type was '<${typeof key}>'`; }
		if (!_exists( params )) {
			throw "params was undefined"; }
		if (typeof params !== "object") {
			throw `object expected for argument 'params'. Type was '<${typeof params}>'`; }
		if (params.type === "*") { 
			return true; }
		if (Object.keys(params).length === 0) { 
			return true; }
		if (typeof params.type === "object") { 
			return this.validateSchemaEntry(key, params.type); }
		if (key.split(".").pop() === "default") {
			if (this._defaults == null) {
				this._defaults = {}; }
			this._defaults[key] = params;
			return true; }
		return `value for schema element '${key}' has invalid type '<${params.type}>'`;
		}
	/**
	 * @param {string} key
	 * @param {string} sKey
	 * @param {object} params
	 */
	validateSchemaParamString(key, sKey, params) {
		let _kind = __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Str.capitalize( params[sKey] );
		let _schemaKeys = _jsd_.schemaRef;
		let opts = __WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].get(this);
		// handles special `restrict` key
		if (sKey === "restrict") {
			try {
				new RegExp(params[sKey]);	}
			catch (e) {
				return e; }
			return true; 
			}
		// rejects values for keys not found in Schema
		if (!_exists(_schemaKeys[sKey]) && opts.extensible === false) {
			return `schema element '${key}.${sKey}' is not allowed`; }
		let eMsg = this.validateTypeString( `${key}.${sKey}`, params[sKey] );
		if (typeof eMsg === "string") {
			return eMsg; }
		return true;
		}
	/**
	 * @param {string} 
	 */
	validateSchemaParam(key, sKey, _schemaKeys, params) {
    	var _type;
    	// rejects unknown element if schema non-extensible
        if (!_exists(_schemaKeys[sKey]) && !__WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].get(this).extensible) { 
        	return `schema element '${key}.${sKey}' is not allowed`; }
        // returns result of Params String Valdiation
        if (typeof params[sKey] === "string") {
        	let _ = this.validateSchemaParamString(key, sKey, params);
        	if (typeof _ === "string") {
        		return _;	}	}
        // returns result of
        if (typeof _schemaKeys[sKey] === "object") {
        	// handles `elements` object
        	if (sKey === "elements") {
        		let _iterate = Array.isArray(params.elements) ? params.elements : Object.keys( params.elements );
        		for (let xKey of _iterate) {
        			let eMsg = this.validateSchemaEntry(`${key}.${xKey}`, params.elements[xKey]);
        			if (typeof eMsg === "string") {
        				return eMsg; }	
        		}
        		return true;	}
        	// attempts to handle Native Types
        	else {
        		_type = _schemaKeys[sKey].type;
        		if (!_exists( _type )) {
        			return `type attribute was not defined for ${key}`; }
        		if (!Array.isArray(_type)) { 
        			_type = _type.type; }
        		}
        	}
        return;
        }
	/**
	 * @param {string} key
	 * @param {object} params
	 * @param {object} opts
	 */
	validateSchemaEntry(key, params, opts) {
		let _schemaKeys = _jsd_.schemaRef;
	    if (!_exists(opts)) { 
	    	opts = __WEBPACK_IMPORTED_MODULE_0__maps__["g" /* _schemaOptions */].get( this ); }
	    if (!_exists(params)) { 
	    	return `${key} was null or undefined`; }
	    if (typeof params === "boolean") { 
	    	return true; }
	    if (typeof params === "string") { 
	    	return this.validateTypeString(`${key}`, params); }
	    if (typeof params === "object") {
	      // handled Objects with no `type` element
	      if (!params.hasOwnProperty("type")) {
	    	  return this.validateUntypedMembers(key, params); }
	      // handles Classes/Functions
	      if ((_jsd_.getClass(params.type)) == null) {
	    	  return this.validateSchemaClass(key, params); }
	      // handles child elements
	      for (let sKey of Object.keys( params )) {
	    	  let _ = this.validateSchemaParam( key, sKey, _schemaKeys, params );
	    	  if (typeof _ === "string") {
	    		  return _;	}	}
	      return true;
	      }
	    // handles non-object entries (Function, String, Number, Boolean, ...)
	    else {
	    	let _t = typeof params;
	    	if (_t !== "function") {
	    		let _ = _schemaKeys[ key.split(".").pop() ];
	    		// tests for everything that"s not a string, _object or function
	    		if ( _ !== __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Str.capitalize(_t)) {
	    			return `value for schema element '${key}' has invalid type :: '<${_t}>'`; } }
	    	else {
	    		let _ = __WEBPACK_IMPORTED_MODULE_0__maps__["j" /* wf */].Fun.getConstructorName(params);
	    		// tests for function"s constructor name
	    		if (_ !== _schemaKeys[key]) { 
	    			return `value for schema element '${key}' has invalid class or method '<${_}>'`; }}
	    	return true;
	    	}
	    // should not have gotten here -- so flag it as error
	    return `unable to process schema element '${key}'`;
	    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SchemaValidator;



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__jsd__ = __webpack_require__(1);

const Validator = {};
/* harmony export (immutable) */ __webpack_exports__["a"] = Validator;

/**
 * @private
 */
class BaseValidator {
    /**
     * @constructor
     */
    constructor(path, signature) {
        this.path = path;
        this.signature = signature;
    }

    /**
     *
     */
    call(path, value) {
        let _ = ValidatorBuilder.getValidators()[path];
        if (_exists(_) && typeof _ === "function") {
            return _(value);
        }
        return `'${path}' has no validator defined`;
    }

    /**
     *
     * @param type
     * @param value
     * @returns {Boolean|String}
     */
    checkType(type, value) {
        let _eval = (type, value) => {
            let _x = (typeof type !== "string") ? _jsd_.getClass([type]) : type;
            if (_x.match(new RegExp(`^${typeof value}$`, "i")) === null) {
                return `'${this.path}' expected ${type}, type was '<${typeof value}>'`
            }
            return true;
        }
        if (_exists(type)) {
            if (Array.isArray(type)) {
                var _ = null;
                for (k in type) {
                    if (typeof (_ = _eval(type[k], value)) === "boolean") {
                        return _;
                    }
                }
                return _;
            }
            return _eval(type, value);
        }
        else {
            return `type for ${this.path} was undefined`;
        }
        return true;
    }

    /**
     *
     */
    exec(value) {
        return `${global.wf.utils.Fun.getClassName(this)} requires override of 'exec'`;
    }
}
/* unused harmony export BaseValidator */

/**
 * @private
 */
Validator.Object = class Obj extends BaseValidator {
    exec(value) {
        let _iterate = (key, _val) => {
            let _p = `${this.path}.${key}`;
            let _v = ValidatorBuilder.getValidators();
            if (!_v.hasOwnProperty(_p)) {
                ValidatorBuilder.create(this.signature.elements[key], _p);
            }
            let _ = this.call(_p, _val);
            if (typeof _ === "string") {
                return _;
            }
        }
        if (typeof value === "object") {
            if (!Array.isArray(value)) {
                for (let _k in value) {
                    let _res = _iterate(_k, value[_k]);
                    if (typeof _res === "string") {
                        return _res;
                    }
                }
            }
            else {
                for (let _ in value) {
                    let e = this.call(this.path, value[_]);
                    if (typeof e === 'string') {
                        return e;
                    }
                }
            }
            return true;
        }
        else {
            let _e = `${this.path} expected value of type 'Object'. Type was '<${typeof value}>'`;
            return _e;
        }
        // should never hit this
        return `${this.path} was unable to be processed`;
    }
}
/**
 * @private
 */
Validator.Boolean = class Bool extends BaseValidator {
    exec(value) {
        return this.checkType("boolean", value);
    }
}
/**
 * @private
 */
Validator.String = class Str extends BaseValidator {
    exec(value) {
        let _;
        if (typeof (_ = this.checkType("string", value)) === "string") {
            return _;
        }
        if (_exists(this.signature.restrict)) {
            let _rxStr;
            let _rxFlags;
            /*
                Allow restrict to be Array or String
                if Array, first element is rx string, second element is rx flags
             */
            if (Array.isArray(this.signature.restrict)) {
                _rxStr = this.signature.restrict[0];
                _rxFlags = this.signature.restrict.length > 1 ? this.signature.restrict[1] : "";
            } else {
                _rxStr = this.signature.restrict;
                _rxFlags = "";
            }

            if (!_exists(new RegExp(_rxStr.replace(/[\\\\]{2,}/g, "\\"), _rxFlags).exec(value))) {
                return `value '${value}' for ${this.path} did not match required expression`;
            }
        }
        return true;
    }
}
/**
 * @private
 */
Validator.Number = class Num extends BaseValidator {
    exec(value) {
        let _ = this.checkType("number", value);
        if (typeof _ === "string") {
            return _;
        }
        // attempts to cast to number
        return !isNaN(new Number(value)) ? true : `${this.path} was unable to process '${value}' as Number`;
    }
}
/**
 * @private
 */
Validator.Function = class Fun extends BaseValidator {
    exec(value) {
        let _x = typeof this.signature.type === 'string' ? this.signature.type : global.wf.Fun.getConstructorName(this.signature.type);
        let _fn = global.wf.Fun.getConstructorName(value);
        return _x === _fn ? true : `${this.path} requires '$_x' got '<${_fn}>' instead`;
    }
}
/**
 * @private
 */
Validator.Default = class Def extends BaseValidator {
    exec(value) {
        _testValidator = (type, value) => {
            let _val = Validator[global.wf.Str.capitalize(type)];
            if (!_exists(_val)) {
                return `'${this.path}' was unable to obtain validator for type '<${type}>'`;
            }
            let _ = new _val(this.path, this.signature);
            return _.exec(value);
        }
        var _x = typeof this.signature.type === 'string' ? _jsd_.getClass(this.signature.type) : this.signature.type;
        let _tR = this.checkType(_x, value);
        if (typeof _tR === "string") {
            return _tR;
        }
        if (Array.isArray(_x)) {
            let _ = _x.map(itm => {
                let _clazz = _jsd_.getClass(itm);
                return _testValidator(_clazz, value);
            });
            return (0 <= _.indexOf(true)) ? true : _[_.length - 1];
        }
        return _testValidator(type, value);
    }
}

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2)))

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__metaData__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__observerBuilder__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__validatorBuilder__ = __webpack_require__(6);



/**
 * @class Set
 */
class Set {
    /**
     * @constructor
     * @param {any} _type
     * @param {any} items
     */
    constructor(_type) {
        let _types;

        if (!_exists(_type)) {
            _type = ['*'];
        } else {
            if (!Array.isArray(_type)) {
                _type = [_type];
            }
        }
        _types = _type.map((type) => {
            let _t = typeof type;

            if (_t === "string") {
                if (type === "*") {
                    return type;
                }

                if (0 <= _jsd_.listClasses().indexOf(type)) {
                    _type = type;
                } else {
                    throw `could not determine type <${type}>`;
                }
            }

            else if ((!_exists(_t)) || _t === "Function") {
                type = "*";
            } else {
                throw `could not determine type <${type}>`;
            }

            return type;
        });

        let _;
        if (!_exists(arguments[1])) {
            _ = new __WEBPACK_IMPORTED_MODULE_0__metaData__["a" /* MetaData */](this, {
                _path: "",
                _root: this
            });
        }
        else {
            _ = (arguments[1] instanceof __WEBPACK_IMPORTED_MODULE_0__metaData__["a" /* MetaData */]) ? arguments[1] : new __WEBPACK_IMPORTED_MODULE_0__metaData__["a" /* MetaData */](this, arguments[1]);
        }
        _mdRef.set(this, _);

        // when we no longer need babel...
        // type = _type;
        // for now we use Weakmap
        _vectorTypes.set(this, _types);
        _object.set(this, new Proxy([], this.handler));
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
        if (Array.isArray(value)) {
            let _m = _object.get(this);
            _m = value;
            return true;
        }
        else {
            __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, `${this.path} requires Array`);
        }
    }

    get handler() {
        return {
            get: (t, idx) => {
                if (typeof idx === 'symbol') {
                    idx = `${String(idx)}`;
                }

                if (idx === 'length') {
                    return t.length;
                }

                if (idx in Array.prototype) {
                    return t[idx];
                }
                if (parseInt(idx) !== NaN) {
                    if (t[idx] instanceof Schema ||
                        t[idx] instanceof Set) {
                        return t[idx].model;
                    }
                    return t[idx];
                }

                return null;
            },
            set: (t, idx, value) => {
                if (!this._typeCheck(value)) {
                    // return false;
                    var eMsg = `item at index ${idx} had wrong type`;
                    __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, eMsg);
                    return false;
                }
                t[idx] = value;
                __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().next(this.path, t);
                return true;
            },
            deleteProperty: (t, idx) => {
                if (idx >= t.length) {
                    const e = `index ${idx} is out of bounds on ${this.path}`;
                    __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().error(this.path, e);
                    return false;
                }
                t.splice(idx, 1);
                __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().next(this.path, t);
                return true;
            }
        };
    }


    /**
     * tests item to see if it conforms to expected item type
     * @param item
     * @returns {boolean}
     * @private
     */
    _typeCheck(item) {
        for (let _t of this.type) {
            if ((typeof _t === "string") && _t.match(/^(\*|ALL)$/)) {
                return true;
            }

            if (!(_t = _jsd_.getClass(_t))) {
                return false;
            }
            if (typeof _t == "string") {
                return typeof item === _t;
            } else if (!global.wf.Obj.isOfType(item, _t)) {
                return false;
            }
        }
        return true;
    }

    /**
     * validates items in Set list
     * @returns {boolean}
     */
    validate() {
        let _path = this.path;
        let _validator = __WEBPACK_IMPORTED_MODULE_2__validatorBuilder__["a" /* ValidatorBuilder */].getInstance();
        this.model.forEach(itm => {
            let e;
            if (typeof (e = _validator.exec(_path, itm)) === 'string') {
                return e;
            }
        });
        return true;
    }

    /**
     *
     * @returns {boolean}
     */
    get isValid() {
        return this.validate() === true;
    }

    /**
     * @param {number} idx
     * @returns {any} element at index if found
     */
    getItemAt(idx) {
        return this.model[idx];
    }

    /**
     * @param {number} idx
     * @param {any} item
     * @returns {Set} reference to self
     */
    setItemAt(idx, item) {
        this.model[idx] = item;
        return this;
    }

    /**
     * @param {number} idx
     * @param {any} item
     * @returns {any} item removed
     */
    removeItemAt(idx) {
        delete this.model[idx];
        return this;
    }

    /**
     * @param {Array} array
     * @returns {Set} reference to self
     */
    replaceAll(array) {
        this.reset();
        for (let itm in array) {
            this.addItem(array[itm]);
        }
        return this;
    }

    /**
     * @param {number} idx
     * @param {any} item
     * @returns {Set} reference to self
     */
    replaceItemAt(idx, item) {
        if (!this._typeCheck(item)) {
            return false;
        }
        if (idx > this.model.length) {
            return false;
        }
        if (idx <= this.model.length) {
            this.model[idx] = item;
        }
        return this;
    }

    /**
     * @param {any} item
     * @returns {Set} reference to self
     */
    addItem(item) {
        this.setItemAt(this.model.length, item);
        return this;
    }

    /**
     * @returns {any} item removed from start of list
     */
    shift() {
        return Reflect.apply(Array.prototype.shift, this.model, []);
    };

    /**
     * @param {any} items to be added
     * @returns {Set} reference to self
     */
    unshift(...items) {
        Reflect.apply(Array.prototype.unshift, this.model, arguments);
        return this;
    }

    /**
     * @returns {any} items removed from end of list
     */
    pop() {
        const v = this.model[this.model.length - 1];
        delete this.model[this.model.length - 1];
        return v
    }

    /**
     * @param {any} items to be added at end of list
     * @returns {Set} reference to self
     */
    push(...items) {
        items.forEach(item => {
            return this.addItem(item);
        });
        return this;
    }

    /**
     * resets list to empty array
     * @returns reference to self
     */
    reset() {
        _object.set(this, new Proxy([], this.handler));
        return this;
    }

    /**
     * @param {function} func - sorrting function
     * @returns {Set} reference to self
     */
    sort(func) {
        this.model.sort(func);
        return this;
    }

    /**
     * @returns primitive value of list
     */
    valueOf() {
        return this.model;
    }

    /**
     * @returns stringified representation of list
     */
    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
    }

    /**
     * returns JSONified representation of list
     */
    toJSON() {
        let _derive = (itm) => {
            if (itm instanceof Schema) {
                return itm.toJSON();
            }
            if (itm instanceof Set) {
                return itm.toJSON();
            };
            if (typeof itm === 'object') {
                const _o = !Array.isArray(itm) ? {} : [];
                for (let k in itm) {
                    _o[k] = _derive(itm[k]);
                }
                return _o;
            };
            return itm;
        };
        return _derive(this.valueOf());
    }


    /**
     * getter for Set type
     * @returns
     */
    get type() {
        // for when we no longer need babel
        // return type;
        return _vectorTypes.get(this);
    }

    /**
     * @returns Unique ObjectID
     */
    get objectID() {
        return _mdRef.get(this).get('_id');
    }

    /**
     *
     */
    get root() {
        return _mdRef.get(this).get('_root');
    }

    /**
     *
     */
    get path() {
        return _mdRef.get(this).path;
    }

    /**
     *
     */
    get parent() {
        let _root;
        if (!(((_root = this.root()) != null) instanceof Schema) && !(_root instanceof Set)) {
            return null;
        }
        return _root.get(this.path().split('.').pop().join('.'));
    }

    /**
     * @returns {number} number of elements in list
     */
    get length() {
        return this.model.length;
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
        let _o = __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(this.path);
        if (!_o || _o === null) {
            __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().create(this.path, this);
            _o = __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(this.path);
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
        let _o = __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(path);
        if (!_o || _o === null) {
            __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().create(path, this);
            _o = __WEBPACK_IMPORTED_MODULE_1__observerBuilder__["a" /* ObserverBuilder */].getInstance().get(path);
        }

        _o.subscribe(func);
        return this;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Set;


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2)))

/***/ })
/******/ ]);
});