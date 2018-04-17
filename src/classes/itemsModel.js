import {
    _object, _schemaHelpers, _oBuilders
} from "./_references";
import {Model} from "./model";
import {SchemaHelpers} from "./_schemaHelpers";
import {makeClean, makeDirty, refAtKeyValidation, refValidation} from "./utils";

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
        if (!Array.isArray(value) || this.isFrozen ||
            !refValidation(this, value)) {
            return false;
        }

        _object.set(this, new Proxy(Model.createRef(this, []), this.handler));

        try {
            let cnt = 0;
            // we delegate observation in the event of whole model replacement
            // to prevent triggering a notification for each item
            // if the user desires such behavior they can use `addItem` with an iterator
            _observerDelegates.set(this, {
                next: () => {
                    if (this.length === value.length) {
                        makeClean(this);
                        _oBuilders.get(this.jsd).next(this);
                    }
                },
                error: () => {
                    // this is a no-op, we dispatch error earlier in the setter pipe
                }
            });
            value.forEach((val) => {
                _object.get(this)[cnt++] = val;
            });
        } catch (e) {
            makeClean(this);
            _oBuilders.get(this.jsd).error(this, e);
            return false;
        }

        makeClean(this);
        _oBuilders.get(this.jsd).next(this);
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
                        return (...args) => {
                            const _arr = [].concat(t);
                            const _val = t[idx].apply(_arr, args);
                            const _res = refValidation(this, _arr);

                            if (_res !== true) {
                                makeClean(this);
                                _oBuilders.get(this.jsd).error(this, this.jsd.errors);
                                return false;
                            }

                            // applies modified array to element
                            this.model = _arr;

                            makeClean(this);
                            _oBuilders.get(this.jsd).next(this);

                            // returns result of operation
                            return _val;
                        }
                    } else {
                        return t[idx];
                    }
                }

                if (idx === "$ref") {
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

                if (!refAtKeyValidation(this, "items", value)) {
                    if (!_oDel) {
                        makeClean(this);
                        _oBuilders.get(this.jsd).error(this, this.jsd.errors);
                    }
                    return false;
                }

                let _oDel = _observerDelegates.get(this);

                // we set the value on the array with success
                if ((typeof value) === "object") {
                    let _sH = _schemaHelpers.get(this);
                    // note we use the last value of `cnt` and walk back one iteration
                    value = _sH.setChildObject(`${this.path}`, value);
                }

                t[idx] = value;

                // makes clean if not serial operation
                if (!_oDel) {
                    makeClean(this);
                }

                // updates observers
                _oBuilders.get(this.jsd).next(this);
                return true;
            },
            deleteProperty: (t, idx) => {
                // creates mock of future Model state for evaluation
                let _o = [].concat(this.model);
                _o.splice(idx, 1);

                // validates mock of change state
                if (!refValidation(this, _o)) {
                    // makes clean if not serial operation
                    if (!_oDel) {
                        makeClean(this);
                    }
                    return false;
                }

                // ensures index of operation is in range
                if (idx >= t.length) {
                    // makes clean if not serial operation
                    if (!_oDel) {
                        makeClean(this);
                    }
                    const e = `index ${idx} is out of bounds on ${this.path}`;
                    _oBuilders.get(this.jsd).error(this, e);
                    return false;
                }

                // applies operation
                t.splice(idx, 1);

                // flags model as in sync with tree
                makeClean(this);

                // updates observers
                _oBuilders.get(this.jsd).next(this, t);
                return true;
            }
        });
    }
}
