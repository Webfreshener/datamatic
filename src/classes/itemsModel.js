import {
    _object, _schemaHelpers
} from "./_references";
import {Model} from "./model";
import {SchemaHelpers} from "./_schemaHelpers";
import {makeClean, makeDirty, refAtKeyValidation, refValidation} from "./utils";
import Notifiers from "./_branchNotifier";
import merge from "lodash.merge";

const _observerDelegates = new WeakMap();

/**
 * @class ItemsModel
 */
export class ItemsModel extends Model {
    /**
     * @constructor
     */
    constructor() {
        super(arguments[0]);
        _schemaHelpers.set(this, new SchemaHelpers(this));
        _object.set(this, new Proxy(Model.createRef(this, []), this.handler));
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
        if (!Array.isArray(value) || this.isFrozen) {
            return false;
        }

        let _idx = 0;
        value.forEach((itm) => {
            let _defaults = this.rxvo.getDefaultsForPath(this.jsonPath);
            if (Object.keys(_defaults).length) {
                value[_idx] = merge(_defaults, itm);
            }
            _idx++;
        });

        if (refValidation(this, value) !== true) {
            Notifiers.get(this.rxvo).sendError(this.jsonPath, this.rxvo.errors);
            return false;
        }

        if (!this.isDirty) {
            // marks model as dirty to prevent cascading validation calls
            makeDirty(this);
        }

        _object.set(this, new Proxy(Model.createRef(this, []), this.handler));
        _observerDelegates.set(this, true);

        try {
            let cnt = 0;

            value.forEach((val) => {
                _object.get(this)[cnt++] = val;
            });

        } catch (e) {
            makeClean(this);
            (Notifiers.get(this.rxvo).sendError.bind(this))(this.jsonPath, e);
            return false;
        }

        makeClean(this);
        if (!this.isDirty) {
            Notifiers.get(this.rxvo).sendNext(this.jsonPath);
            _observerDelegates.delete(this);
        }

        return true;
    }

    get handler() {
        return Object.assign(super.handler, {
            get: (t, idx) => {
                // TODO: review for removal
                // if (typeof idx === "symbol") {
                //     idx = `${String(idx)}`;
                // }

                if (idx === "length") {
                    return t.length;
                }

                if (idx in Array.prototype) {
                    // only handle methods that modify the reference array
                    if (["fill", "pop", "push", "shift", "splice", "unshift"].indexOf(idx) > -1) {
                        return applyMethod(this, t, idx);
                    } else {
                        return t[idx];
                    }
                }

                if (idx === "$model") {
                    return this;
                }

                return t[idx];
            },
            set: (t, idx, value) => {
                if (idx in Array.prototype) {
                    // do nothing against proto props
                    return true;
                }

                // -- ensures we aren't in a frozen hierarchy branch
                if (this.isFrozen) {
                    return false;
                }

                let _oDel = _observerDelegates.get(this);

                if (refAtKeyValidation(this, "items", value) !== true) {
                    if (_oDel !== void(0)) {
                        makeClean(this);
                        Notifiers.get(this.rxvo).sendError(this.jsonPath, this.rxvo.errors);
                    }
                    return false;
                }

                // we set the value on the array with success
                if ((typeof value) === "object") {
                    let _sH = _schemaHelpers.get(this);
                    value = _sH.setChildObject(`${this.path}`, value);
                }

                t[idx] = value;

                // makes clean if not serial operation
                if (_oDel !== void(0)) {
                    makeClean(this);
                    // updates observers
                    // Notifiers.get(this.rxvo).sendNext(this.jsonPath);
                }

                return true;
            },

            deleteProperty: (t, idx) => {
                return deleteTrap(this, t, idx);
            }
        });
    }
}

/**
 * Handles Proxy Delete Trap for Array elements
 * @param model
 * @param t
 * @param idx
 * @returns {boolean}
 */
const deleteTrap = (model, t, idx) => {
    let _oDel = _observerDelegates.get(model);
    // creates mock of future Model state for evaluation
    let _o = [].concat(t);
    try {
        // attempts splice method to
        // remove item at given index index
        _o.splice(idx, 1);
    } catch (e) {
        if (!_oDel) {
            makeClean(model);
            Notifiers.get(model.rxvo).sendError(model.jsonPath, e);
        }
        return false;
    }

    // validates mock of change state
    const _res = refValidation(model, _o);


    if (_res !== true) {
        // makes clean and notifies
        // if not serial operation
        if (!_oDel) {
            makeClean(model);
            Notifiers.get(model.rxvo).sendError(model.jsonPath, _res);
        }
        return false;
    }

    // applies operation
    t.splice(idx, 1);

    // flags model as in sync with tree
    makeClean(model);

    // updates observers
    Notifiers.get(model.rxvo).sendNext(model.jsonPath);
    return true;
};

/**
 * Handles proxy get for Array proto methods
 * @param model
 * @param t
 * @param idx
 * @returns {function(...[*]=)}
 */
const applyMethod = (model, t, idx) => {

    // returns closure analog to referenced method
    return (...args) => {
        // mocks current model state
        const _arr = [].concat(t);

        // applies method to model state
        const _val = t[idx].apply(_arr, args);

        // validates updated mock
        const _res = refValidation(model, _arr);

        // in event of validation failure
        if (_res !== true) {
            // .. marks model as clean
            makeClean(model);

            // .. sends notifications
            Notifiers.get(model.rxvo).sendError(model.jsonPath,
                model.rxvo.errors);

            return false;
        }

        // model is a kludge to handle updates from proto methods
        if (model.parent !== null) {
            // applies change to parent object if model is not root context
            model.parent.model[model.jsonPath.split(".").pop()] = _arr;
        } else {
            // applies change to RxVO instance
            model.rxvo.model = _arr;
        }

        return _val;
    }
};