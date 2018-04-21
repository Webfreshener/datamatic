import {
    _object, _schemaHelpers, _oBuilders,
} from "./_references";
import {makeClean, makeDirty, refAtKeyValidation, refValidation} from "./utils";
import {SchemaHelpers} from "./_schemaHelpers";
import {Model} from "./model";
import Notifiers from "./_branchNotifier";

/**
 * @class PropertiesModel
 */
export class PropertiesModel extends Model {
    /**
     *
     */
    constructor() {
        super(arguments[0]);

        // stores SchemaHelpers reference for use
        _schemaHelpers.set(this, new SchemaHelpers(this));

        // sets Proxy Model reference on map
        _object.set(this, new Proxy(Model.createRef(this, {}), this.handler));
    }

    /**
     * Handler for Object Proxy Evaluation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        const _self = this;
        return Object.assign(super.handler, {
            get: (t, key) => {
                return key === "$ref" ? this : t[key];
            },
            set: (t, key, value) => {
                let _sH = _schemaHelpers.get(this);

                if (key in Object.prototype) {
                    // do nothing against proto props
                    return true;
                }

                // -- ensures we aren't in a frozen hierarchy branch
                if (this.isFrozen) {
                    return false;
                }

                // checks for branch update status
                if (!this.isDirty) {
                    let _o = Object.assign({}, t);
                    _o[key] = value;
                    // attempts validation of value update
                    if (refValidation(this, _o) !== true) {
                        makeClean(this);
                        _oBuilders.get(this.rxvo).error(_self, this.rxvo.errors);
                        return false;
                    }
                }

                // if key is type 'object', we will set directly
                if (typeof key === "object") {
                    const e = _sH.setObject(key);
                    if (typeof e === "string") {
                        makeClean(this);
                        _oBuilders.get(this.rxvo).error(_self, e);
                        return false;
                    }
                    return true;
                }
                // calls validate with either full path if in PropertiesModel or key if nested in ItemsModel
                if ((typeof value) === "object") {
                    value = _sH.setChildObject(key, value);
                    if ((typeof value) === "string") {
                        // marks model as clean
                        makeClean(this);

                        // sends notifications
                        _oBuilders.get(this.rxvo).error(_self, value);
                        return false;
                    }
                }

                // performs the operation on Model
                t[key] = value;
                return true;
            },
            deleteProperty: (t, key) => {
                // creates mock of future model state for evaluation
                let _o = Object.assign({}, this.model);
                delete _o[key];

                // validates model with value removed
                if (!this.validate(_o)) {
                    return false;
                }

                // performs delete operation on model
                delete t[key];
                return true;
            }
        });
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
        if ((typeof value) !== "object" || this.isFrozen) {
            return false;
        }

        if (refValidation(this, value) !== true) {
            Notifiers.get(this.rxvo).sendError(this.jsonPath, this.rxvo.errors);
            return false;
        }

        if (!this.isDirty) {
            // marks model as dirty to prevent cascading validation calls
            makeDirty(this);
        }

        // defines new Proxy Object for data modeling
        // todo: replace proxy with Object Delegation
        _object.set(this,
            new Proxy(Model.createRef(this, {}), this.handler));

        Object.keys(value).forEach((k) => {
            // -- added try/catch to avoid error in JSFiddle
            try {
                this.model[k] = value[k];
            } catch (e) {
                // marks model as clean
                makeClean(this);

                // sends notications
                Notifiers.get(this.rxvo).sendError(this.jsonPath, e);
                return false;
            }
        });

        // marks model as in sync with tree
        makeClean(this);

        // calls next's observable to update subscribers
        if (!this.isDirty) {
            Notifiers.get(this.rxvo).sendNext(this.jsonPath);
        }

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

        if (!this.isDirty) {
            // marks model as dirty to prevent cascading validation calls
            makeDirty(this);
        }

        // applies validated value to model
        this.model[key] = value;

        // updates observers
        Notifiers.get(this.rxvo).sendNext(this.jsonPath);

        // removes dirtiness
        makeClean(this);

        return this;
    }
}
