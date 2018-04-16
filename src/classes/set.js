import {
    _object, _schemaHelpers, _vPaths, _validPaths, _oBuilders
} from "./_references";
import {Model} from "./model";
import {SchemaHelpers} from "./_schemaHelpers";
import {makeClean, refAtKeyValidation, refValidation} from "./utils";

const _observerDelegates = new WeakMap();

/**
 * @class Set
 */
export class Set extends Model {
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
        if (!Array.isArray(value) || this.isLocked ||
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
                        _oBuilders.get(this.jsd).next(this.path, this);
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
            console.error(e);
            // return _oBuilders.get(this.jsd).error(this.path, e);
        }

        makeClean(this);

        _oBuilders.get(this.jsd).next(this.path, this);
        return true;
    }

    get handler() {
        return {
            get: (t, idx) => {
                // TODO: review for removal
                // if (typeof idx === "symbol") {
                //     idx = `${String(idx)}`;
                // }

                if (idx === "length") {
                    return t.length;
                }

                if (idx in Array.prototype) {
                    return t[idx];
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

                if (!refAtKeyValidation(this, "items", value)) {
                    return false;
                }

                let _oDel = _observerDelegates.get(this);

                const sendErr = (msg) => {
                    if (_oDel) {
                        _oDel.error(msg);
                    } else {
                        _oBuilders.get(this.jsd).error(this.path, msg);
                    }
                };

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
                _oBuilders.get(this.jsd).next(this.path, this);
                return true;
            },
            deleteProperty: (t, idx) => {
                // creates mock of future Model state for evaluation
                let _o = [].concat(this.model);
                _o.splice(idx, 1);

                // validates mock of change state
                if (!refValidation(this, _o)) {
                    return false;
                }

                // ensures index of operation is in range
                if (idx >= t.length) {
                    const e = `index ${idx} is out of bounds on ${this.path}`;
                    _oBuilders.get(this.jsd).error(this.path, e);
                    return false;
                }

                // applies operation
                t.splice(idx, 1);

                // flags model as in sync with tree
                makeClean(this);

                // updates observers
                _oBuilders.get(this.jsd).next(this.path, t);
                return true;
            }
        };
    }

    /**
     * @param {number} idx
     * @returns {any} element at index if found
     */
    getItemAt(idx) {
        return this.model[idx];
    }

    /**
     * @param {number} idx
     * @param {any} item
     * @returns {Set} reference to self
     */
    setItemAt(idx, item) {
        this.model[idx] = item;
        return this;
    }

    /**
     *
     * @param idx
     * @returns {Set}
     */
    removeItemAt(idx) {
        delete this.model[idx];
        return this;
    }

    /**
     * @param {Array} array
     * @returns {Set} reference to self
     */
    replaceAll(array) {
        this.model = array;
        return this;
    }

    /**
     * @param {number} idx
     * @param {any} item
     * @returns {boolean|Set} reference to self
     */
    replaceItemAt(idx, item) {
        if (!this.validatorBuilder.exec(this.path, item)) {
            return false;
        }
        if (idx > this.model.length) {
            return false;
        }
        if (idx <= this.model.length) {
            this.model[idx] = item;
        }
        return this;
    }

    /**
     * @param {any} item
     * @returns {Set} reference to self
     */
    addItem(item) {
        this.setItemAt(this.model.length, item);
        return this;
    }

    /**
     * @returns {any} item removed from start of list
     */
    shift() {
        return Reflect.apply(Array.prototype.shift, this.model, []);
    };

    /**
     * @param {any} items to be added
     * @returns {Set} reference to self
     */
    unshift(...items) {
        Reflect.apply(Array.prototype.unshift, this.model, arguments);
        return this;
    }

    /**
     * @returns {any} items removed from end of list
     */
    pop() {
        const v = this.model[this.model.length - 1];
        delete this.model[this.model.length - 1];
        return v
    }

    /**
     * @param {any} items to be added at end of list
     * @returns {Set} reference to self
     */
    push(...items) {
        items.forEach(item => {
            return this.addItem(item);
        });
        _oBuilders.get(this.jsd).next(this.path, this);
        return this;
    }

    /**
     * resets list to empty array
     * @returns {Set} reference to self
     */
    reset() {
        _object.set(this, new Proxy(Model.createRef(this, []), this.handler));
        return this;
    }

    /**
     * @param {function} func - sorting function
     * @returns {Set} reference to self
     */
    sort(func) {
        this.model.sort(func);
        return this;
    }

    /**
     * @returns {number} number of properties in list
     */
    get length() {
        return this.model.length || 0;
    }
}
