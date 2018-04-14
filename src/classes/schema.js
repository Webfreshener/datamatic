import {
    _object, _schemaHelpers, _schemaSignatures,
    _validPaths, _vPaths, _validators, _oBuilders
} from "./_references";
import {SchemaHelpers} from "./_schemaHelpers";
import {Model} from "./model";

/**
 * utility method to handle model data validation against json-schema
 * @param {Model} model
 * @param {JSON|Boolean|Number|String} value
 * @return {boolean}
 */
const refValidation = (model, value) => {
    const path = (model instanceof Model) ? model.validationPath : `${model}`;
    const _v = _validators.get(model.jsd);
    // tests data against schema for validation
    if (!_v.exec(path, value)) {
        // in case of error, update Observers and return false
        _oBuilders.get(model.jsd).error(model.path, _v.errors);
        return false;
    }
    return true;
};

/**
 * @class Schema
 */
export class Schema extends Model {
    /**
     *
     */
    constructor() {
        super(arguments[0]);

        // creates instance of SchemaHelpers
        const _sH = new SchemaHelpers(this);

        // stores SchemaHelpers reference for later use
        _schemaHelpers.set(this, _sH);


        _vPaths.set(this, this.path);

        _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));
    }

    /**
     * Handler for Object Proxy Evaluation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        return {
            get: (t, key) => {
                return key === "$ref" ? this : t[key];
            },
            set: (t, key, value) => {
                let _sH = _schemaHelpers.get(this);

                // if key is type'object', we will set directly
                if (typeof key === "object") {
                    const e = _sH.setObject(key);
                    if (typeof e === "string") {
                        _oBuilders.get(this.jsd).error(this.path, e);
                        return false;
                    }
                    _validPaths.get(this.jsd)[this.path] = true;
                    return true;
                }

                // calls validate with either full path if in Schema or key if nested in Set
                if ((typeof value) === "object") {
                    value = _sH.setChildObject(key, value);
                    if ((typeof value) === "string") {
                        _validPaths.get(this.jsd)[this.path] = value;
                        _oBuilders.get(this.jsd).error(this.path, value);
                        return false;
                    }
                }
                t[key] = value;
            }

        };
    }

    /**
     * utility method to create selector path
     * @param path
     * @param addr
     * @returns {string}
     */
    static concatPathAddr(path, addr) {
        return path.length ? `${path}/${addr}` : `${addr}`;
    }

    /**
     * @returns schema signature object
     */
    get signature() {
        return JSON.parse(_schemaSignatures.get(this));
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
        // fails on attempts to set scalar value
        // or if this node is locked or fails validation
        if ((typeof value) !== "object" ||
            this.isLocked || !refValidation(this, value)) {
            return false;
        }

        // defines new Proxy Object for data modeling
        // todo: replace proxy with Object Delegation
        _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));

        // flags this node as being out of sync with tree
        // -- will validate and set models
        _validPaths.get(this.jsd)[this.path] = -1;

        const keys = Object.keys(value);
        if (keys.length) {
            keys.forEach((k) => {
                // -- added try/catch to avoid error in jsfiddle
                try {
                    this.model[k] = value[k];
                } catch (e) {
                    _validPaths.get(this.jsd)[this.path] = e;
                    _oBuilders.get(this.jsd).error(this.path, e);
                    return false;
                }
            });
        }

        // update the flag on this node as being in sync with tree
        // -- validation is complete and are models set
        _validPaths.get(this.jsd)[this.path] = true;
        
        // calls next's observable to update subscribers
        _oBuilders.get(this.jsd).next(this.path, this);
        return true;
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
        // attempts validaton of value against schema
        if (!_validators.get(this.jsd).exec(`${this.validationPath}/${key}`, value)) {
            return false;
        }

        // applies validated value to model
        this.model[key] = value;

        // updates observers
        _oBuilders.get(this.jsd).next(this.path, this);

        // returns chainable reference
        return this;
    }
}
