import {_mdRef, _object, _vectorTypes, _schemaOptions, _exists, _vBuilders, wf} from "./_references";
import {MetaData} from "./_metaData";
import {SchemaValidator} from "./_schemaValidator";
import {Schema} from "./schema";
import {JSD} from "./jsd";
import {Model} from "./model";
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
        _mdRef.set(this, __);
        _schemaOptions.set(this, opts);


        if (!_exists(_signature)) {
            _signature = [{type: "*"}];
        } else {
            switch (typeof _signature) {
                case "object":
                    if (!Array.isArray(_signature)) {
                        _signature = [_signature];
                    } else {
                        _signature = _signature.map((sig) => {
                            return typeof sig === "string" ? {type: sig} : sig;
                        });
                    }
                    break;
                case "string":
                    _signature = [{type: _signature}];
                    break;
                default:
                    throw `schema for ${this.path} was invalid`;
            }
        }
        // attempts to validate provided `schema` entries
        let _sV = new SchemaValidator(_signature, Object.assign(this.options || {}, {
            jsd: _mdRef.get(this).jsd,
        }), this);

        // throws error if error message returned
        if (typeof (eMsg = _sV.isValid()) === "string") {
            throw eMsg;
        }

        this.validatorBuilder.create(_signature, this.path, this);
        _object.set(this, new Proxy([], this.handler));
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
            try {
                let cnt = 0;
                value.forEach((val) => {
                    this.model[cnt] = val;
                    cnt++;
                });
            } catch (e) {
                return this.observerBuilder.error(this.path, e);
            }

            this.observerBuilder.next(this.path, this);
            return true;
        } else {
            this.observerBuilder.error(this.path, `${this.path} requires Array`);
        }
    }

    get handler() {
        return {
            get: (t, idx) => {
                if (typeof idx === "symbol") {
                    idx = `${String(idx)}`;
                }

                if (idx === "length") {
                    return t.length;
                }

                if (idx in Array.prototype) {
                    return t[idx];
                }
                if (parseInt(idx) !== NaN) {
                    if (t[idx] instanceof Schema ||
                        t[idx] instanceof Set) {
                        return t[idx].model;
                    }
                    return t[idx];
                }

                return null;
            },
            set: (t, idx, value) => {
                let msg = this.validatorBuilder.exec(this.path, value);
                if ((typeof msg) === "string") {
                    this.observerBuilder.error(this.path, msg);
                    return false;
                }
                t[idx] = value;
                // this.observerBuilder.next(this.path, t);
                return true;
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
        this.reset();
        for (let itm in array) {
            this.addItem(array[itm]);
        }
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
     * @param {function} func - sorrting function
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
