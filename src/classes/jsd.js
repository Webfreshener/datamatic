/**
 * Strict JS Objects and Collections created from JSON Schema Definitions
 * @class JSD
 * @example const _jsd = new JSD();
 * _jsd.document = {name: "test"};
 * console.log(`${jsd.document.name}`);
 * // -> "test"
 * console.log(`${jsd.document.get("."}`);
 * // -> Schema
 */
import {wf, _kinds, _validPaths, _oBuilders, _vBuilders} from "./_references";
import {ObserverBuilder} from "./_observerBuilder";
import {ValidatorBuilder} from "./_validatorBuilder";
import {Schema} from "./schema";
import {Set} from "./set";
import {SchemaValidator} from "./_schemaValidator";

const _documents = new WeakMap();

/**
 * JSD Document Entrypoint
 * @public
 */
export class JSD {
    /**
     * @constructor
     * @param schema
     * @param options
     */
    constructor(schema = JSD.defaults, options = Schema.defaultOption) {
        _kinds.set(this, {
            "Array": Array,
            "ArrayBuffer": ArrayBuffer,
            "Boolean": Boolean,
            "Buffer": ArrayBuffer,
            "Date": Date,
            "Number": Number,
            "Object": Object,
            "String": String,
            "Function": Function,
        });


        const vBuilder = new ValidatorBuilder(this);
        _vBuilders.set(this, vBuilder);
        _validPaths.set(this, {});
        _oBuilders.set(this, new ObserverBuilder());

        let _useSet = false;

        if ((Array.isArray(schema)) ||
            (schema.hasOwnProperty("type") && schema.type === "Array")) {
            _useSet = true;
            // internally we handle all Sets as Polymorphic elements
            schema = {"*": {polymorphic: Array.isArray(schema) ? schema : [schema]}};
        }

        // attempts to validate provided `schema` entries
        let _sV = new SchemaValidator(schema, Object.assign({}, this.options, {
            jsd: this,
        }));

        let eMsg;
        // throws error if error message returned
        if (typeof (eMsg = _sV.isValid) === "string") {
            throw eMsg;
        }

        _documents.set(this, new (!_useSet ? Schema : Set)(schema, options, this));
    }

    /**
     * @param key {String}
     */
    get(key) {
        return _documents.get(this).get(key);
    }

    /**
     * getter for Model document
     * @returns {Schema|Set}
     */
    get document() {
        return _documents.get(this);
    }

    /**
     * getter for validation status
     * @returns {boolean}
     */
    get isValid() {
        return this.document.isValid;
    }

    /**
     * @param {string|function|string[]} classesOrNames
     * @returns {function|function[]|string|string[]|*[]}
     */
    getClass(classesOrNames) {
        let _k = _kinds.get(this);
        if (!Array.isArray(classesOrNames)) {
            classesOrNames = [classesOrNames];
        }
        // traverses arguments
        for (let arg of classesOrNames) {
            if ((typeof arg) === "string") {
                if (arg === "*") {
                    // handles special * type
                    return "*";
                }
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
                let _ = wf.Fun.getConstructorName(arg);
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
        return _kinds.get(this)[name] = clazz;
    }

    /**
     * @param {string} name
     */
    unregisterClass(name) {
        if (_kinds.hasOwnProperty(name)) {
            return delete _kinds.get(this)[name];
        }
        return false
    }

    /**
     * lists registered Class Names
     * @return {string[]}
     */
    listClasses() {
        return Object.keys(_kinds.get(this));
    }

    /**
     * creates new Schema from JSON data
     * @param {string|object} json
     * @returns {JSD}
     */
    static fromJSON(json) {
        let _;
        if (_ = (typeof json).match(/^(string|object)+$/)) {
            return new JSD((_[1] === "string") ? JSON.parse(json) : json);
        }
        throw new Error("json must be either JSON formatted string or object");
    }

    /**
     * getter for base schema element signature
     * @returns {object}
     */
    get schemaRef() {
        let _keys = [].concat(Object.keys(_kinds.get(this)));
        return {
            type: {
                type: _keys,
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
            type: "Object",
            required: false,
            extensible: true,
            writeLock: false,
            elements: {
                "*": {
                    type: "*",
                    required: false,
                    extensible: true
                }
            }
        };
    }
}
