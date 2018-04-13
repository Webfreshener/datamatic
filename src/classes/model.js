import {
    _mdRef, _oBuilders, _vBuilders, _exists,
    _validPaths, _object, _schemaSignatures
} from "./_references";
import {JSD} from "./jsd";
import {remapPolypath} from "./utils";
import {MetaData} from "./_metaData";

/**
 *
 * @param ref
 * @param writeLock
 * @param metaRef
 */
const createMetaDataRef = (ref, writeLock, metaRef) => {
    let _md;
    if (metaRef instanceof JSD) {
        // root elements are handed the JSD object
        // will create new MetaData and set reference as root element
        _md = new MetaData(ref, {
            _path: "",
            _root: ref,
            _writeLock: writeLock,
            _jsd: metaRef,
        });
    }
    else if ((typeof metaRef) === "object") {
        // extends MetaData reference
        if (metaRef instanceof MetaData) {
            _md = metaRef;
        } else {
            // todo: re-evaluate this line for possible removal
            _md = new MetaData(this, metaRef);
        }
    } else {
        throw "Invalid attempt to construct Model." +
        "tip: use `new JSD([schema])` instead"
    }
    // sets MetaData object to global reference
    _mdRef.set(ref, _md);
};

/**
 *
 */
export class Model {
    constructor(writeLock = false) {
        // tests if this is instance of MetaData
        if (!(this instanceof MetaData)) {
            createMetaDataRef(this, writeLock, arguments[1]);
        }
    }

    /**
     * subscribes handler method to observer for model
     * @param func
     * @returns {_subs}
     */
    subscribe(func) {
        return this.subscribeTo(this.path, func);
    }

    /**
     * stub for sub-class implementation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        throw "Model requires sub-classed implmentation of handler getter"
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     * @returns {_subs}
     */
    subscribeTo(path, func) {
        // throws if argument is not an object or function
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error("subscribeTo requires function");
        }

        // creates an extensible object to hold our unsubscribe method
        const _subs = class {};
        const _subRefs = [];
        // references the ObserverBuilder for the path
        let _o = this.observerBuilder.get(path);

        if (!_o || _o === null) {
            this.observerBuilder.create(path, this);
            _o = this.observerBuilder.get(path);
        }

        // adds onNext handler if `next` prop is defined
        if (func.hasOwnProperty("next")) {
            _subRefs.push(_o.onNext.subscribe({next: func.next}));
        }

        // adds onError handler if `error` prop is defined
        if (func.hasOwnProperty("error")) {
            _subRefs.push(_o.onError.subscribe({next: func.error}));
        }

        // adds onComplete handler if `complete` prop is defined
        if (func.hasOwnProperty("complete")) {
            _subRefs.push(_o.onComplete.subscribe({next: func.complete}));
        }

        // adds unsubscribe to the Proto object
        _subs.prototype.unsubscribe = () => {
            _subRefs.forEach((sub) => {
                sub.unsubscribe();
            });
        };
        return new _subs();
    }

    /**
     * @returns {boolean|string} returns error string or true
     */
    validate() {
        const paths = _validPaths.get(this.jsd);
        try {
            Object.keys(paths).forEach((k) => {
                const _t = typeof paths[k];
                if (_t === "string") {
                    throw paths[k];
                }
            });
        } catch (e) {
            return e;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    get isValid() {
        return (typeof this.validate() !== "string");
    }

    /**
     * gets raw value of this model
     * @returns {*}
     */
    valueOf() {
        return _object.get(this);
    }

    /**
     * JSONifies Schema Model
     */
    toJSON() {
        let _derive = (itm) => {
            if (itm.hasOwnProperty("toJSON") &&
                (typeof this.toJSON) === "function") {
                return itm.toJSON();
            }
            if (typeof itm === "object") {
                const _o = !Array.isArray(itm) ? {} : [];
                for (let k in itm) {
                    if (itm.hasOwnProperty(k)) {
                        _o[k] = _derive(itm[k]);
                    }
                }
                return _o;
            }
            return itm;
        };
        return _derive(this.valueOf());
    }

    /**
     * JSON stringifies primitive value
     * @param pretty - `prettifies` JSON output for readability
     */
    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
    }

    /**
     * @returns {string} Object ID for Schema
     */
    get objectID() {
        return _mdRef.get(this)._id;
    }

    /**
     * getter for document root element
     * @returns {Model}
     */
    get root() {
        return _mdRef.get(this).root || this;
    }

    /**
     * getter for `path` to current Element
     * @returns {string}
     */
    get path() {
        let __ = _mdRef.get(this).path;
        return _exists(__) ? __ : "";
    }

    /**
     * getter for models parent Schema or Set element
     * @returns {Model}
     */
    get parent() {
        let __ = _mdRef.get(this).root;
        return _exists(__) ? __ : this;
    }

    /**
     * getter for model"s JSD owner object
     * @returns {JSD}
     */
    get jsd() {
        return _mdRef.get(this).jsd;
    }

    /**
     * getter for ValidatorBuilder reference
     * @returns {ValidatorBuilder}
     */
    get validatorBuilder() {
        return _vBuilders.get(this.jsd);
    }

    /**
     * getter for ObserverBuilder reference
     * @returns {ObserverBuilder}
     */
    get observerBuilder() {
        return _oBuilders.get(this.jsd);
    }

    /**
     * applies Object.freeze to model and triggers complete notification
     * @returns {Model}
     */
    lock() {
        Object.freeze(_object.get(this));
        const _self = this;
        setTimeout(()=> {
            _self.observerBuilder.complete(_self.path, _self);
        }, 0);
        return this;
    }

    /**
     *
     * @returns {boolean}
     */
    get isLocked() {
        return Object.isFrozen(_object.get(this));
    }


    get validationPath() {
        let _p = remapPolypath(this.path);
        if (this.schema.hasOwnProperty("polymorphic")) {
            _p = _p.replace(/(\.\d\.(?!polymorphic))+/, ".*.polymorphic.");
        }

        return _p;
    }

    /**
     * TODO: remove and standardize around `signature`
     * @returns {*}
     */
    get schema() {
        return JSON.parse(_schemaSignatures.get(this));
    }

    /**
     *
     * @returns {*}
     */
    get signature() {
        return this.schema;
    }

    /**
     * creates owner Model reference on Proxied data object
     * @param ref
     * @param obj
     * @returns {*}
     */
    static createRef(ref, obj) {
        Object.defineProperty(obj, "$ref", {
            value: ref,
            writable: false
        });
        return obj;
    };
}