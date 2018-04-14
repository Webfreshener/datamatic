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
import {_validPaths, _oBuilders, _validators, _schemaSignatures} from "./_references";
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
        // attempts t get user passes Avj options
        let ajvOptions = options.ajvOptions || null;

        // defines AjvWrapper instance for this Document and it's Schemas
        const _ajv = new AjvWrapper(this, schema, ajvOptions);

        // sets AjvWrapper instance on map for use
        _validators.set(this, _ajv);

        // throws error if error message returned
        if (!_validators.get(this).validator.validateSchema(schema)) {
            throw _validators.get(this).errors;
        }

        Object.freeze(schema);
        _schemaSignatures.set(this, schema);

        _validPaths.set(this, {});
        _oBuilders.set(this, new ObserverBuilder());

        let _useSet = false;

        // if value of type is "array" or an array of items is defined,
        // we handle as Array
        if ((schema.hasOwnProperty("type") && schema.type === "array") ||
            (schema.hasOwnProperty("items") && Array.isArray(schema.items))) {
            _useSet = true;
        }

        // creates root level document and sets it to this scope's document reference
        _documents.set(this, new (!_useSet ? Schema : Set)(this));
    }

    /**
     * getter for Model document
     * @returns {Schema|Set}
     */
    get document() {
        return _documents.get(this);
    }

    get schema() {
        return _schemaSignatures.get(this);
    }

    /**
     * getter for validation status
     * @returns {boolean}
     */
    get isValid() {
        return this.document.isValid;
    }

    /**
     * implements toString
     * @return {string}
     */
    toString() {
        return `${this.document}`;
    }

    /**
     * implements toJSON
     * @return {*}
     */
    toJSON() {
        return this.document.toJSON();
    }

    /**
     * creates new Schema from JSON data
     * @param {string|object} json -- JSON Object or String
     * @param {object} options - JSD options object
     * @returns {JSD}
     */
    static fromJSON(json, options) {
        let __ = (typeof json).match(/^(string|object)+$/);
        if (__) {
            return new JSD((__[1] === "string") ? JSON.parse(json) : json, options);
        }
        throw new Error("json must be either JSON formatted string or object");
    }
}
