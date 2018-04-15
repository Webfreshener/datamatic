import {_exists, _mdRef, _validators} from "./_references";
import {MetaData} from "./_metaData";
import {Schema} from "./schema";
import {Set} from "./set";

/**
 * @private
 */
export class SchemaHelpers {
    /**
     * @constructor
     */
    constructor(_ref) {
        if (!_exists(_ref) || (typeof _ref) !== "object") {
            throw new Error("arguments[0] must be an object");
        }

        this._ref = _ref;
        Object.seal(this);
    }

    /**
     * Sets Object key/vals upon Schema Reference
     * @param obj
     * @returns {*}
     */
    setObject(obj) {
        if (typeof obj === "string") {
            return obj;
        }
        // calls set with nested key value pair
        Object.keys(obj).forEach((k) => {
            let eMsg = this._ref.set(k, obj[k]);
            if (typeof eMsg === "string") {
                throw new Error(eMsg);
            }
        });
        return this._ref;
    }

    /**
     * Creates Child Model and set data on it
     * @param key
     * @param value
     * @returns {*}
     */
    setChildObject(key, value) {
        let _mdData = _mdRef.get(this._ref);
        let _s = this.createSchemaChild(key, value, _mdData);
        if (typeof _s === "string") {
            return _s;
        } else if (!_exists(_s) ||
            typeof _s !== "object") {
            return `'${key}' was invalid`;
        }
        _s.model = value;
        return _s.model;
    }

    /**
     * Creates Child Model
     * @param {string} key
     * @param {*} value
     * @param {MetaData} metaData
     * @returns {Model|string} - Schema, Set or error string
     */
    createSchemaChild(key, value, metaData) {
        // populates MetaData config object
        let _d = Object.assign({
            _path: `${this._ref.path}.${key}`,
            _parent: this._ref,
            _root: this._ref.root,
            _jsd: this._ref.jsd,
        }, metaData || {});

        // constructs new MetaData object with owner as reference point for chaining
        let _md = new MetaData(this._ref, _d);

        // returns new child Model
        return new ((!Array.isArray(value)) ? Schema : Set)(_md);
    }

    /**
     * Validates data on owner model against schema
     * @param key
     * @param value
     * @return {boolean|string[]}
     */
    validate(key, value) {
        const _v = _validators.get(this._ref.jsd);
        if (!_v.validate(`${this._ref.validationPath}/`, value)) {
            return _v.errors;
        }

        return true;
    }
}
