import {
    _object, _schemaHelpers, _vPaths, _oBuilders,
} from "./_references";
import {SchemaHelpers} from "./_schemaHelpers";
import {Model} from "./model";
import {makeClean, refAtKeyValidation, refValidation} from "./utils";

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

        // sets validation status reference to map
        _vPaths.set(this, this.path);

        // sets Proxy Model reference on map
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

                // refAtKeyValidation(this, key, value);
                // if key is type 'object', we will set directly
                if (typeof key === "object") {
                    const e = _sH.setObject(key);
                    if (typeof e === "string") {
                        _oBuilders.get(this.jsd).error(this.path, e);
                        return false;
                    }
                    return true;
                }
                // calls validate with either full path if in Schema or key if nested in Set
                if ((typeof value) === "object") {
                    value = _sH.setChildObject(key, value);
                    if ((typeof value) === "string") {
                        _oBuilders.get(this.jsd).error(this.path, value);
                        return false;
                    }
                }

                // performs the operation on Model
                t[key] = value;
                return true;
            },
            deleteProperty: (t, key) => {
                // creates mock of future Model state for evaluation
                let _o = Object.assign({}, this.model);
                delete _o[key];

                // validates model with value removed
                if (!this.test(_o)) {
                    return false;
                }

                // performs the operation on Model
                delete t[key];
                return true;
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
        if ((typeof value) !== "object" || this.isLocked ||
            !refValidation(this, value)) {
            return false;
        }

        // defines new Proxy Object for data modeling
        // todo: replace proxy with Object Delegation
        _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));

        Object.keys(value).forEach((k) => {
            // -- added try/catch to avoid error in JSFiddle
            try {
                this.model[k] = value[k];
            } catch (e) {
                _oBuilders.get(this.jsd).error(this.path, e);
                return false;
            }
        });

        // marks model as in sync with tree
        makeClean(this);

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
        // attempts validation of value against schema
        if (!refAtKeyValidation(this, key, value)) {
            return false;
        }

        // applies validated value to model
        this.model[key] = value;

        // updates observers
        _oBuilders.get(this.jsd).next(this.path, this);

        // removes dirtiness
        makeClean(this);

        return this;
    }

    /**
     * Tests value for validation without setting value to Model
     * @param {JSON} value - JSON value to test for validity
     * @return {boolean}
     */
    test(value) {
        try {
            if (!refValidation(this, value)) {
                // explicit failure on validation
                return false;
            }
        } catch (e) {
            // couldn't find schema, so is Additional Properties
            // todo: review `removeAdditional` ajv option for related behavior
            return true;
        }

        return true;
    }
}
