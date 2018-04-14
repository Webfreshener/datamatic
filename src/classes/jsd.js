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
import {default as Ajv} from "ajv";

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

        const _ajv = new Ajv({allErrors: false});

        const vBuilder = new ValidatorBuilder(this);
        _vBuilders.set(this, vBuilder);
        _validPaths.set(this, {});
        _oBuilders.set(this, new ObserverBuilder());

        let _useSet = false;

        if ((Array.isArray(schema)) ||
            (schema.hasOwnProperty("type") && schema.type === "Array")) {
            _useSet = true;
            // internally we handle all Sets as Polymorphic properties
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
                    // traverses array properties
                    for (let n of arg) {
                        //- tests properties
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
            properties: ["Object", "Array"],
            polymorphic: {
                type: ["Object", "Array"],
                required: false,
                properties: {
                    type: {
                        type: this.listClasses(),
                        required: true
                    },
                    extensible: "Boolean",
                    restrict: "String",
                    validate: "Function",
                    default: "*",
                    properties: ["Object", "Array"]
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
            properties: {
                "*": {
                    type: "*",
                    required: false,
                    extensible: true
                }
            }
        };
    }
}

/**
 * AJV Options Config in it's entirely for reference
 * only JSD specific option changes are enabled
 * @type {{extendRefs: string, useDefaults: boolean}}
 * @private
 */
const _ajvOptions = {
    // // validation and reporting options:
    // $data:            false,
    // allErrors:        false,
    // verbose:          false,
    // $comment:         false, // NEW in Ajv version 6.0
    // jsonPointers:     false,
    // uniqueItems:      true,
    // unicode:          true,
    // format:           'fast',
    // formats:          {},
    // unknownFormats:   true,
    // schemas:          {},
    // logger:           undefined,
    // referenced schema options:
    // schemaId:         '$id',
    // missingRefs:      true,
    extendRefs:       'fail', // default 'ignore'
    // loadSchema:       undefined, // function(uri: string): Promise {}
    // options to modify validated data:
    // removeAdditional: false,
    useDefaults:      true,
    // coerceTypes:      false,
    // asynchronous validation options:
    // transpile:        undefined, // requires ajv-async package
    // advanced options:
    // meta:             true,
    // validateSchema:   true,
    // addUsedSchema:    true,
    // inlineRefs:       true,
    // passContext:      false,
    // loopRequired:     Infinity,
    // ownProperties:    false,
    // multipleOfPrecision: false,
    // errorDataPath:    'object', // deprecated
    // messages:         true,
    // sourceCode:       false,
    // processCode:      undefined, // function (str: string): string {}
    // cache:            new Cache,
    // serialize:        undefined
};
