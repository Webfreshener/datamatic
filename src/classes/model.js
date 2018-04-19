import {
    _mdRef, _oBuilders, _exists,
    _object, _schemaOptions, _dirtyModels
} from "./_references";
import {JSD} from "./jsd";
import {MetaData} from "./_metaData";
import {makeClean, makeDirty, validate} from "./utils";

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
     * Subscribes handler method to property observer for path
     * @param path
     * @param func
     * @return {Observable}
     */
    subscribeTo(path, func) {
        const _oBuilder = _oBuilders.get(this.jsd);
        const _o = _oBuilder.getObserverForPath(path);
        if (_o === null) {
            return _o;
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
        const _subs = class {};

        // adds unsubscribe to the Proto object
        _subs.prototype.unsubscribe = () => {
            _subRefs.forEach((sub) => {
                sub.unsubscribe();
            });
        };

        return new _subs();
    }

    /**
     * Tests value for validation without setting value to Model
     * @param {json} value - JSON value to validate for validity
     * @return {boolean}
     */
    validate(value) {
        try {
           return validate(this, this.validationPath, value);
        } catch (e) {
            // couldn't find schema, so is Additional Properties
            // todo: review `removeAdditional` ajv option for related behavior
            return true;
        }


    }

    /**
     * resets Model to empty value
     * @return {Model}
     */
    reset() {
        const _isArray = Array.isArray(this.model);
        const _o = !_isArray ? {} : [];
        const _res = this.validate(_o);
        // validates that this model be returned to an empty value
        if (_res !== true) {
            _oBuilders.get(this.jsd).error(this, _res);
            return this;
        }

        // marks this model as out of sync with tree
        makeDirty(this);

        // closure to handle the freeze operation safely
        const _freeze = (itm) => {
            if (!Object.isFrozen(itm)) {
                itm.freeze();
            }
        };

        // freezes all child Model/Elements
        // -- prevent changes to Children
        // -- sends "complete" notification to their Observers
        // -- revokes their Models if revocable
        const _i = !_isArray ? Object.keys(this.model) : this.model;
        _i.forEach((itm) => _freeze((!_isArray) ? _i[itm] : itm));

        // creates new Proxied Model to operate on
        const _p = new Proxy(Model.createRef(this, _o), this.handler);
        _object.set(this, _p);

        // marks this model as back in sync with tree
        makeClean(this);

        // sends notification of model change
        _oBuilders.get(this.jsd).next(this);

        return this;
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

                    // we validate for property to avoid warnings
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
     * Applies Object.freeze to model and triggers complete notification
     * -- unlike Object.freeze, this prevents modification
     * -- to all children in Model hierarchy
     * @returns {Model}
     */
    freeze() {
        Object.freeze(_object.get(this));
        _oBuilders.get(this.jsd).complete(this);
        return this;
    }

    /**
     *
     * @return {object}
     */
    get handler() {
        return {
            setPrototypeOf: () => false,
            isExtensible: (t) => Object.isExtensible(t),
            preventExtensions: (t) => Object.preventExtensions(t),
            getOwnPropertyDescriptor: (t, key) => Object.getOwnPropertyDescriptor(t, key),
            defineProperty: (t, key, desc) => Object.defineProperty(t, key, desc),
            has: (t, key) => key in t,
            ownKeys: (t) => Reflect.ownKeys(t),
            apply: () => false,
        };
    }

    /**
     * stub for model getter, overridden by Model sub-class
     * @return {object|array|null}
     */
    get model() {
        return null;
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
        return _mdRef.get(this).path || "";
    }

    /**
     * Getter for Model's parent
     * @returns {Model}
     */
    get parent() {
        // attempts to get parent
        return _mdRef.get(this).parent || null;
    }

    /**
     * Getter for Model validation status for hierarchy
     * @return {boolean}
     */
    get isDirty() {
        let _res = _dirtyModels.get(this.jsd)[this.path] || false;
        return _res || ((this.parent === null) ? false : this.parent.isDirty);
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
     * Getter for Object.isFrozen status of this node and it's ancestors
     * @returns {boolean}
     */
    get isFrozen() {
        let _res = Object.isFrozen(_object.get(this));
        return !_res ? ((this.parent === null) ? false : this.parent.isFrozen) : _res;
    }

    /**
     * Provides formatted string for json-schema lookup
     * @return {string}
     */
    get validationPath() {
        return this.path === "" ? "root#/" : `root#${this.path}`;
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