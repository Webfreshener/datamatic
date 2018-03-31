import {_mdRef, _oBuilders, _vBuilders, _exists, _validPaths, _object, _schemaSignatures} from "./_references";
import {Schema} from "./schema";
import {Set} from "./set";
import {JSD} from "./jsd";
import {Observable} from "rxjs/Rx";
import {remapPolypath} from "./utils";
export class Model {
    constructor() {
        _object.set(this, new Proxy(Model.createRef(this), this.handler));
    }
    /**
     * subscribes handler method to observer for model
     * @param func
     * @returns {Observable}
     */
    subscribe(func) {
        return this.subscribeTo(this.path, func);
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     * @returns {Observable}
     */
    subscribeTo(path, func) {
        // throws if argument is not an object or function
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error("subscribeTo requires function");
        }

        // creates an extensible object to hold our unsubscribe method
        const _subs = class {};

        // references the ObserverBuilder for the path
        let _o = this.observerBuilder.get(path);

        if (!_o || _o === null) {
            this.observerBuilder.create(path, this);
            _o = this.observerBuilder.get(path);
        }

        // adds onNext handler if `next` prop is defined
        if (func.hasOwnProperty("next")) {
            _o.onNext.subscribe({next: func.next});
        }

        // adds onError handler if `error` prop is defined
        if (func.hasOwnProperty("error")) {
            _o.onError.subscribe({next: func.error});
        }

        // adds onComplete handler if `complete` prop is defined
        if (func.hasOwnProperty("complete")) {
            _o.onComplete.subscribe({next: func.complete});
        }

        // adds unsubscribe to the Proto object
        _subs.prototype.unsubscribe = () => {
            _o.onNext.unsubscribe();
            _o.onError.unsubscribe();
            _o.onComplete.unsubscribe();
        };
        return new _subs();
    }

    /**
     * @returns {true|string} returns error string or true
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
     */
    valueOf() {
        return this.model;
    }

    /**
     * JSONifies Schema Model
     */
    toJSON() {
        let _derive = (itm) => {
            if (itm instanceof Schema) {
                return itm.toJSON();
            }
            if (itm instanceof Set) {
                return itm.toJSON();
            }
            if (typeof itm === "object") {
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
     * @returns {Schema|Set}
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
     * @returns {Schema|Set}
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
        if (Object.keys(this.schema).indexOf("polymorphic") >= 0) {
            _p = _p.replace(/(\.\d\.(?!polymorphic))+/, ".*.polymorphic.");
            // _schemaSignatures.set(this, _schemaSignatures.get(this).polymorphic);
        }
        return _p;
    }

    /**
     *
     * @returns {*}
     */
    get schema() {
        return JSON.parse(_schemaSignatures.get(this));
    }

    /**
     * TODO: remove and standardize around `schema`
     * @returns {*}
     */
    get signature() {
        return this.schema;
    }

    /**
     *
     * @param ref
     * @returns {{}}
     */
    static createRef(ref) {
        let _o = ref instanceof Set ? [] : {};
        Object.defineProperty(_o, "$ref", {
            value: ref,
            writable: false
        });
        return _o;
    };
}