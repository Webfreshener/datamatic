import {
    _mdRef, _object, _schemaOptions,
    _exists, _schemaHelpers, _schemaSignatures, _observers
} from "./_references";
import {MetaData} from "./_metaData";
import {SchemaValidator} from "./_schemaValidator";
import {Schema} from "./schema";
import {JSD} from "./jsd";
import {Model} from "./model";
import {SchemaHelpers} from "./_schemaHelpers";

const _observerDelegates = new WeakMap();

/**
 * @class Set
 */
export class Set extends Model {
    /**
     * @constructor
     * @param {any} _type
     * @param {any} items
     */
    constructor(_signature, opts = {}) {
        super();
        // tests for metadata
        let __;
        if (arguments[2] instanceof JSD) {
            __ = new MetaData(this, {
                _path: "",
                _root: this,
                _jsd: arguments[2],
            });
        }

        else if (arguments[2] instanceof MetaData) {
            __ = arguments[2];
        } else {
            throw `Invalid constructor call for Set: ${JSON.stringify(arguments)}`;
        }

        // stores our MetaData reference to WeakMap
        _mdRef.set(this, __);
        // stores our user Options into Weakmap
        _schemaOptions.set(this, opts);

        // creates a default signature if none present
        if (!_exists(_signature)) {
            _signature = [{type: "*"}];
        }

        // internally we handle all Sets as Polymorphic elements
        _signature = {polymorphic: _signature};

        // attempts to validate provided `schema` entries
        let _sV = new SchemaValidator(_signature, Object.assign(this.options || {}, {
            jsd: _mdRef.get(this).jsd,
        }), this);

        // throws error if error message returned
        if (typeof (eMsg = _sV.isValid()) === "string") {
            throw eMsg;
        }

        const _sig = _signature || JSD.defaults;
        _schemaSignatures.set(this, JSON.stringify(_sig));
        _schemaHelpers.set(this, new SchemaHelpers(this));
        _schemaHelpers.get(this).walkSchema(_sig, `${this.path}.*`);
        // _schemaHelpers.get(this).walkSchema(_sig, this.validationPath);

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
        if (Array.isArray(value)) {
            if (!this.isLocked) {
                _object.set(this, new Proxy(Model.createRef(this), this.handler));
            }

            try {
                let cnt = 0;
                // we delegate observation in the event of whole model replacement
                // to prevent triggering a notification for each item
                // if the user desires such behavior they can use `addItem` with an iterator
                _observerDelegates.set(this, {
                    next: (col) => {
                        if (this.length === value.length) {
                            _observerDelegates.delete(this);
                        }
                    },
                    error: (e) => {
                        _observerDelegates.delete(this);
                        throw e;
                    }
                });
                value.forEach((val) => {
                    _object.get(this)[cnt] = val;
                    cnt++;
                });
            } catch (e) {
                return this.observerBuilder.error(this.path, e);
            }
            if ((typeof this.isValid) === "boolean") {
                this.observerBuilder.next(this.path, this);
                return true;
            } else {
                this.observerBuilder.error(this.path, this.validate());
                return false;
            }
        } else {
            this.observerBuilder.error(this.path, `${this.path} requires Array`);
        }
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

                let _oDel = _observerDelegates.get(this);
                const sendErr = (e) => {
                    if (_oDel) {
                        _oDel.error(msg);
                    } else {
                        this.observerBuilder.error(this.path, msg);
                    }
                };

                let msg = this.validatorBuilder.exec(`${this.path}.${idx}`, value);
                if ((typeof msg) === "string") {
                    sendErr(msg);
                    return false;
                }

                if ((typeof value) === "object") {
                    let _sH = _schemaHelpers.get(this);
                    value = _sH.createSetElement(idx, value);
                }

                t[idx] = value;
                msg = this.validate();
                if ((typeof msg) === "boolean") {
                    if (_oDel) {
                        _oDel.next(this);
                    } else {
                        this.observerBuilder.next(this.path, this);
                    }
                    return true;
                } else {
                    sendErr(msg);
                    return false;
                }
            },
            deleteProperty: (t, idx) => {
                if (idx >= t.length) {
                    const e = `index ${idx} is out of bounds on ${this.path}`;
                    this.observerBuilder.error(this.path, e);
                    return false;
                }
                t.splice(idx, 1);
                this.observerBuilder.next(this.path, t);
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
     * @returns {Set} reference to self
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
        this.observerBuilder.next(this.path, this);
        return this;
    }

    /**
     * resets list to empty array
     * @returns reference to self
     */
    reset() {
        _object.set(this, new Proxy([], this.handler));
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
     * @returns {number} number of elements in list
     */
    get length() {
        return this.model.length || 0;
    }
}
