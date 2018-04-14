import {
    _mdRef, _oBuilders, _exists,
    _validPaths, _object, _schemaSignatures,
    _schemaOptions
} from "./_references";
import {JSD} from "./jsd";
import {MetaData} from "./_metaData";

/**
 *
 * @param ref
 * @param writeLock
 * @param metaRef
 */
const createMetaDataRef = (ref, metaRef) => {
    let _md;
    if (metaRef instanceof JSD) {
        // root properties are handed the JSD object
        // will create new MetaData and set reference as root element
        _md = new MetaData(ref, {
            _path: "",
            _root: ref,
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
    constructor() {
        // tests if this is instance of MetaData
        if (!(this instanceof MetaData)) {
            createMetaDataRef(this, arguments[0]);
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
        let _o = _oBuilders.get(this.jsd).get(path);

        if (!_o || _o === null) {
            _oBuilders.get(this.jsd).create(path, this);
            _o = _oBuilders.get(this.jsd).get(path);
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
     * get options (if any) for this model"s schema
     */
    get options() {
        return _schemaOptions.get(this);
    }

    /**
     * applies Object.freeze to model and triggers complete notification
     * @returns {Model}
     */
    lock() {
        Object.freeze(_object.get(this));
        const _self = this;
        setTimeout(()=> {
            _oBuilders.get(_self.jsd).complete(_self.path, _self);
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

    /**
     * provides formatted string for json-schema lookup
     * @return {string}
     */
    get validationPath() {
        return `root#/${this.path.replace(/\./, '/properties/')}`;
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