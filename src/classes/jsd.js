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
import {_validPaths, _oBuilders, _validators} from "./_references";
import {ObserverBuilder} from "./_observerBuilder";
import {Schema} from "./schema";
import {Set} from "./set";
import {AjvWrapper} from "./_ajvWrapper";
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
    constructor(schema, options = {}) {
        // defines AjvWrapper instance for this Document and it's Schemas
        _validators.set(this, new AjvWrapper(this, schema, options.ajvOptions || null));
        // throws error if error message returned
        if (!_validators.get(this).validator.validateSchema(schema)) {
            throw _validators.get(this).errors;
        }

        _validPaths.set(this, {});
        _oBuilders.set(this, new ObserverBuilder());

        let _useSet = false;

        if (schema.hasOwnProperty("type") &&
            schema.type === "array") {
            _useSet = true;
        }

        let eMsg;


        _documents.set(this, new (!_useSet ? Schema : Set)(this));
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
     * creates new Schema from JSON data
     * @param {string|object} json
     * @param {object} options
     * @returns {JSD}
     */
    static fromJSON(json, options) {
        let _;
        if (_ = (typeof json).match(/^(string|object)+$/)) {
            return new JSD((_[1] === "string") ? JSON.parse(json) : json, options);
        }
        throw new Error("json must be either JSON formatted string or object");
    }
}
