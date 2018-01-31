import {_mdRef, _object, _vectorTypes, _exists, wf} from './_references';
import {MetaData} from './_metaData';
import {ValidatorBuilder} from './_validatorBuilder';
import {Schema} from './schema';
import {JSD} from './jsd'
/**
 * @class Set
 */
export class Set {
    /**
     * @constructor
     * @param {any} _type
     * @param {any} items
     */
    constructor(_type) {
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
            _type = ['*'];
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
            }

            else if ((!_exists(_t)) || _t === "Function") {
                type = "*";
            } else {
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
            this.jsd.observerBuilder.error(this.path, `${this.path} requires Array`);
        }
    }

    get handler() {
        return {
            get: (t, idx) => {
                if (typeof idx === 'symbol') {
                    idx = `${String(idx)}`;
                }

                if (idx === 'length') {
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
                    this.jsd.observerBuilder.error(this.path, eMsg);
                    return false;
                }
                t[idx] = value;
                this.jsd.observerBuilder.next(this.path, t);
                return true;
            },
            deleteProperty: (t, idx) => {
                if (idx >= t.length) {
                    const e = `index ${idx} is out of bounds on ${this.path}`;
                    this.jsd.observerBuilder.error(this.path, e);
                    return false;
                }
                t.splice(idx, 1);
                this.jsd.observerBuilder.next(this.path, t);
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
     * validates items in Set list
     * @returns {boolean}
     */
    validate() {
        let _path = this.path;
        let _validator = ValidatorBuilder.getInstance();
        this.model.forEach(itm => {
            let e;
            if (typeof (e = _validator.exec(_path, itm)) === 'string') {
                return e;
            }
        });
        return true;
    }

    /**
     *
     * @returns {boolean}
     */
    get isValid() {
        return this.validate() === true;
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
     * @param {number} idx
     * @param {any} item
     * @returns {any} item removed
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
     * @returns primitive value of list
     */
    valueOf() {
        return this.model;
    }

    /**
     * @returns stringified representation of list
     */
    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
    }

    /**
     * returns JSONified representation of list
     */
    toJSON() {
        let _derive = (itm) => {
            if (itm instanceof Schema) {
                return itm.toJSON();
            }
            if (itm instanceof Set) {
                return itm.toJSON();
            }
            if (typeof itm === 'object') {
                const _o = !Array.isArray(itm) ? {} : [];
                for (let k in itm) {
                    _o[k] = _derive(itm[k]);
                }
                return _o;
            }
            return itm;
        };
        return _derive(this.valueOf());
    }


    /**
     * getter for Set type
     * @returns
     */
    get type() {
        // for when we no longer need babel
        // return type;
        return _vectorTypes.get(this);
    }

    /**
     * @returns Unique ObjectID
     */
    get objectID() {
        return _mdRef.get(this).get('_id');
    }

    /**
     *
     */
    get root() {
        return _mdRef.get(this).get('_root');
    }

    /**
     *
     */
    get path() {
        return _mdRef.get(this).path;
    }

    /**
     *
     */
    get parent() {
        let _root;
        if (!(((_root = this.root()) !== null) instanceof Schema)
            && !(_root instanceof Set)) {
            return null;
        }
        return _root.get(this.path().split('.').pop().join('.'));
    }

    get jsd() {
        return _mdRef.get(this).jsd;
    }

    /**
     * @returns {number} number of elements in list
     */
    get length() {
        return this.model.length;
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     */
    subscribe(func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribe requires function');
        }
        let _o = this.jsd.observerBuilder.get(this.path);
        if (!_o || _o === null) {
            this.jsd.observerBuilder.create(this.path, this);
            _o = this.jsd.observerBuilder.get(this.path);
        }
        _o.subscribe(func);
        return this;
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     */
    subscribeTo(path, func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribeTo requires function');
        }
        let _o = this.jsd.observerBuilder.get(path);
        if (!_o || _o === null) {
            this.jsd.observerBuilder.create(path, this);
            _o = this.jsd.observerBuilder.get(path);
        }

        _o.subscribe(func);
        return this;
    }
}
