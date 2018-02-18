import {_mdRef, _object, _vectorTypes, _oBuilders, _vBuilders, _exists, wf} from "./_references";
import {MetaData} from "./_metaData";
import {ValidatorBuilder} from "./_validatorBuilder";
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
    constructor(_type) {
        super();
        // tests for metadata
        let _;
        if (arguments[1] instanceof JSD) {
            _ = new MetaData(this, {
                _path: "",
                _root: this,
                _jsd: arguments[1],
            });
        }
        else if (arguments[1] instanceof MetaData) {
            _ = arguments[1];
        } else {
            throw `Invalid constructor call for Set: ${JSON.stringify(arguments)}`;
        }
        _mdRef.set(this, _);

        // tests for types
        let _types;

        if (!_exists(_type)) {
            _type = ["*"];
        } else {
            if (!Array.isArray(_type)) {
                _type = [_type];
            }
        }

        _types = _type.map((type) => {
            let _t = typeof type;
            if (_t === "string") {
                if (type === "*") {
                    return type;
                }

                if (0 <= this.jsd.listClasses().indexOf(type)) {
                    _type = type;
                } else {
                    throw `could not determine type <${type}>`;
                }
            } else if (_t === 'object') {
                type = _t;
            } else if ((!_exists(_t)) || _t === "Function") {
                type = "*";
            }

            else {
                throw `could not determine type <${type}>`;
            }

            return type;
        });

        // when we no longer need babel...
        // type = _type;
        // for now we use Weakmap
        _vectorTypes.set(this, _types);
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
            let _m = _object.get(this);
            _m = value;
            return true;
        }
        else {
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
                if (!this._typeCheck(value)) {
                    var eMsg = `item at index ${idx} had wrong type`;
                    this.observerBuilder.error(this.path, eMsg);
                    return false;
                }
                t[idx] = value;
                this.observerBuilder.next(this.path, t);
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
     * tests item to see if it conforms to expected item type
     * @param item
     * @returns {boolean}
     * @private
     */
    _typeCheck(item) {
        for (let _t of this.type) {
            if ((typeof _t === "string") && _t.match(/^(\*|ALL)$/)) {
                return true;
            }

            if (!(_t = this.jsd.getClass(_t))) {
                return false;
            }
            if (typeof _t === "string") {
                return typeof item === _t;
            } else if (!wf.Obj.isOfType(item, _t)) {
                return false;
            }
        }
        return true;
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
        if (!this._typeCheck(item)) {
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
        return this.model.length;
    }

    /**
     * getter for Set type
     * @returns
     */
    get type() {
        return _vectorTypes.get(this);
    }
}
