import {
    _mdRef, _oBuilders, _exists,
    _validPaths, _object,
    _schemaOptions, _dirtyModels
} from "./_references";
import {JSD} from "./jsd";
import {MetaData} from "./_metaData";

/**
 *
 * @param ref
 * @param metaRef
 */
const createMetaDataRef = (ref, metaRef) => {
    let _md;
    if (metaRef instanceof JSD) {
        // root properties are handed the JSD object
        // will create new MetaData and set reference as root element
        _md = new MetaData(ref, {
            _path: "",
            _parent: null,
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
     * Subscribes handler method to observer for model
     * @param func
     * @returns {Observable}
     */
    subscribe(func) {
        return this.subscribeTo(this.path, func);
    }

    /**
     * Stub for sub-class implementation
     * @returns {{get: function, set: function}}
     */
    get handler() {
        throw "Model requires sub-classed implementation of handler getter"
    }

    /**
     * Subscribes handler method to property observer for path
     * @param path
     * @param func
     * @return {Observable}
     */
    subscribeTo(path, func) {
        // throws if argument is not an object or function
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error("subscribeTo requires function");
        }

        // references the ObserverBuilder for the path
        let _o = _oBuilders.get(this.jsd).get(path);

        // creates observer reference for given `path` value
        if (!_o || _o === null) {
            _oBuilders.get(this.jsd).create(path, this);
            _o = _oBuilders.get(this.jsd).get(path);
        }

        // references to subscriptions for Observable
        const _subRefs = [];

        // init's observer handlers if defined on passed `func` object
        [
            {call: "onNext", func: "next"},
            {call: "onError", func: "error"},
            {call: "onComplete", func: "complete"},
        ].forEach((obs) => {
            if (func.hasOwnProperty(obs.func)) {
                _subRefs.push(_o[obs.call].subscribe({next: func[obs.func]}));
            }
        });

        // creates an extensible object to hold our unsubscribe method
        // and adds unsubscribe calls to the Proto object
        const _subs = (class {}).prototype.unsubscribe = () => {
            _subRefs.forEach((sub) => {
                sub.unsubscribe();
            });
        };

        return new _subs();
    }

    /**
     * Performs validation on present Model's State
     * todo: review for removal
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
     *
     * @returns {boolean}
     */
    get isValid() {
        return (typeof this.validate() !== "string");
    }

    /**
     * Raw value of this Model
     * @returns {*}
     */
    valueOf() {
        return _object.get(this);
    }

    /**
     * Provides JSON object representation of Model
     */
    toJSON() {
        let _derive = (itm) => {

            // uses toJSON impl if defined
            if (itm.hasOwnProperty("toJSON") &&
                (typeof this.toJSON) === "function") {
                return itm.toJSON();
            }

            // builds new JSON tree if value is object
            if (typeof itm === "object") {
                const _o = !Array.isArray(itm) ? {} : [];
                for (let k in itm) {

                    // we test for property to avoid warnings
                    if (itm.hasOwnProperty(k)) {

                        // applies property to tree
                        _o[k] = _derive(itm[k]);
                    }
                }

                // returns new JSON tree
                return _o;
            }
            // hands back itm if value wasn't usable
            return itm;
        };

        // uses closure for evaluation
        return _derive(this.valueOf());
    }

    /**
     * Provides JSON String representation of Model
     * @param pretty - `prettifies` JSON output for readability
     */
    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
    }

    /**
     * Getter for Model's Unique Object ID
     * @returns {string} Object ID for Model
     */
    get objectID() {
        return _mdRef.get(this)._id;
    }

    /**
     * Getter for root element of Model hierarchy
     * @returns {Model}
     */
    get root() {
        return _mdRef.get(this).root || this;
    }

    /**
     * Getter for `path` to current Element
     * @returns {string}
     */
    get path() {
        let __ = _mdRef.get(this).path;
        return _exists(__) ? __ : "";
    }

    /**
     * Getter for Model's parent
     * @returns {Model}
     */
    get parent() {
        // attempts to get parent
        return _mdRef.get(this).parent;
    }

    /**
     * Getter for Model validation status for hierarchy
     * @return {boolean}
     */
    get isDirty() {
        let _res = _dirtyModels.get(this.jsd)[this.path];
        return _res === void(0) ? ((this.parent === null) ? false : this.parent.isDirty) : _res;
    }

    /**
     * Getter for model's JSD owner object
     * @returns {JSD}
     */
    get jsd() {
        return _mdRef.get(this).jsd;
    }

    /**
     * Get options (if any) for this model's schema
     * todo: review for possible removal
     * @return {any}
     */
    get options() {
        return _schemaOptions.get(this);
    }

    /**
     * Applies Object.freeze to model and triggers complete notification
     * todo: review name refactor to `freeze`
     * @returns {Model}
     */
    lock() {
        Object.freeze(_object.get(this));
        const _self = this;
        setTimeout(() => {
            _oBuilders.get(_self.jsd).complete(_self.path, _self);
        }, 0);
        return this;
    }

    /**
     * Getter for locked status
     * todo: review name refactor to `isFrozen`
     * @returns {boolean}
     */
    get isLocked() {
        let _res = Object.isFrozen(_object.get(this));
        return !_res ? ((this.parent === null) ? false : this.parent.isLocked) : _res;
    }

    /**
     * Provides formatted string for json-schema lookup
     * @return {string}
     */
    get validationPath() {
        return this.path === "" ? "root#/" : `root#${this.path.replace(/\./g, '/properties/')}`;
    }

    /**
     * todo: implement with ajv
     * @returns {*}
     */
    get schema() {
        return this; // _validators.get(this.jsd).$ajv.compile({$ref: this.validationPath});
    }

    /**
     * todo: remove and standardize around `schema`
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