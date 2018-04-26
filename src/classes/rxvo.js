import {
    _oBuilders, _validators, _dirtyModels, _schemaSignatures
} from "./_references";
import {ObserverBuilder} from "./_observerBuilder";
import {PropertiesModel} from "./propertiesModel";
import {ItemsModel} from "./itemsModel";
import {AjvWrapper} from "./_ajvWrapper";
import Notifiers from "./_branchNotifier";
import {getDefaults, walkObject} from "./utils";
const _defaults = new WeakMap();
const _documents = new WeakMap();
/**
 * RxVo Model Entry-point
 * @public
 */
export class RxVO {
    /**
     * @constructor
     * @param {json} schema
     * @param {object} options
     */
    constructor(schema, options = {}) {
        // attempts t get user passes Avj options
        let ajvOptions = options.hasOwnProperty("ajvOptions") ?
            options["ajvOptions"] : null;

        // defines AjvWrapper instance for this Document and it's Schemas
        const _ajv = new AjvWrapper(this, schema, ajvOptions);

        // sets AjvWrapper instance on map for use
        _validators.set(this, _ajv);

        // throws error if error message returned
        if (!_ajv.$ajv.validateSchema(schema, false)) {
            throw _ajv.$ajv.errors;
        }

        Object.freeze(schema);
        _schemaSignatures.set(this, schema);
        _oBuilders.set(this, new ObserverBuilder());

        let _useSet = false;

        // if value of type is "array" or an array of items is defined,
        // we handle as Array
        if ((schema.hasOwnProperty("type") && schema["type"] === "array") ||
            (schema.hasOwnProperty("items") && Array.isArray(schema["items"]))) {
            _useSet = true;
        }

        // stores default values for this model
        _defaults.set(this, getDefaults(schema));

        // creates holder for dirty model flags in this scope
        _dirtyModels.set(this, {});

        // creates root level document
        const _doc = new (!_useSet ? PropertiesModel : ItemsModel)(this);

        // applies Subject Handlers to root document
        _oBuilders.get(this).create(_doc);

        // sets document to this scope
        _documents.set(this, _doc);

        // creates RxJS Notification Delegate
        Notifiers.create(this);
    }

    /**
     * Getter for root Model
     * @returns {object|array}
     */
    get model() {
        return _documents.get(this).model;
    }

    /**
     * Setter for root Model value
     * @param {object|array} value
     */
    set model(value) {
        _documents.get(this).model = value;
    }

    /**
     * Getter for document's JSON-Schema
     * @return {any}
     */
    get schema() {
        return _schemaSignatures.get(this);
    }

    /**
     * Retrieves JSON-Schema element for given Path
     * @param path
     * @returns {any}
     */
    getSchemaForPath(path) {
        return walkObject(path, this.schema);
    }

    /**
     * Retrieves default values from JSON-Schema properties
     * @param path
     * @returns {{}&any}
     */
    getDefaultsForPath(path = "") {
        return walkObject(path, _defaults.get(this), ".");
    }

    /**
     * Validates data against named schema
     * @param path
     * @param value
     * @return {*|void|RegExpExecArray}
     */
    validate(path, value) {
        return _validators.get(this).exec(path, value);
    }

    /**
     * Getter for Ajv validation error messages
     * @return {error[] | null}
     */
    get errors() {
        return _validators.get(this).$ajv.errors || null;
    }

    /**
     *
     * @param to
     * @returns {Object|Array}
     */
    getPath(to) {
        let _ref = this.model;
        to = to.replace(/\/?(properties|items)+\//g, ".").replace(/^\./, "");
        (to.split(".")).forEach((step) => {
            if (_ref[step]) {
                _ref = _ref[step];
            }
        });

        return _ref;
    }

    /**
     * Retrieves all Models at given path
     * @param to
     * @returns {Array[]|Object[]}
     */
    getModelsInPath(to) {
        const _steps = [this.model];
        let _ref = this.model;
        to = to.replace(/\/?(properties|items)+\/?/g, ".");
        (to.split(".")
            .filter((itm, idx, arr) => arr.indexOf(itm) > -1))
            .forEach((step) => {
            if (_ref[step]) {
                _ref = _ref[step];
                _steps.push(_ref);
            }
        });
        return _steps;
    }

    /**
     * Subscribes observer to root Model
     * @param observer
     * @returns {Observable}
     */
    subscribe(observer) {
        return _documents.get(this).subscribe(observer);
    }

    /**
     * Subscribes observer to Model at path
     * @param path
     * @param observer
     * @returns {Observable}
     */
    subscribeTo(path, observer) {
        return _documents.get(this).subscribeTo(path, observer);
    }

    /**
     * Implements toString
     * @return {string}
     */
    toString() {
        return `${this.model.$model}`;
    }

    /**
     * Implements toJSON
     * @return {*}
     */
    toJSON() {
        return this.model.$model.toJSON();
    }

    /**
     * Creates new PropertiesModel from JSON data
     * @param {string|json} json -- JSON Object or String
     * @param {object} options - RxVO options object
     * @returns {RxVO}
     */
    static fromJSON(json, options) {
        // quick peek at json param to ensure it looks ok
        const __ = (typeof json).match(/^(string|object)+$/);

        if (__) {
            // attempts to create RxVO from JSON or JSON string
            return new RxVO((__[1] === "string") ?
                JSON.parse(json) : json, options);
        }

        // throws error if something didn't look right with the json param
        throw new Error("json must be either JSON formatted string or object");
    }
}
