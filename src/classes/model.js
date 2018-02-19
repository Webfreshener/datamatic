import {_mdRef, _oBuilders, _vBuilders, _exists, _validPaths} from "./_references";
import {Schema} from "./schema";
import {Set} from "./set";
import {JSD} from "./jsd";
import {Observable} from 'rxjs/Rx';
export class Model {
    /**
     * subscribes handler method to observer for model
     * @param func
     * @returns {Observable}
     */
    subscribe(func) {
       return this.subscribeTo(this.path, func);
    }

    /**
     * unsubscribes from this object"s observer
     */
    unsubscribe() {
        let _o = this.observerBuilder.get(this.path);
        if (!_o || _o === null) {
            _o.unsubscribe();
        }
    }

    /**
     * subscribes handler method to property observer for path
     * @param path
     * @param func
     * @returns {Observable}
     */
    subscribeTo(path, func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error("subscribeTo requires function");
        }
        let _o = this.observerBuilder.get(path);
        if (!_o || _o === null) {
            this.observerBuilder.create(path, this);
            _o = this.observerBuilder.get(path);
        }
        if (func.hasOwnProperty('next')) {
            _o.onNext.subscribe({next: func.next});
        }
        if (func.hasOwnProperty('error')) {
            _o.onError.subscribe({next: func.error});
        }
        if (func.hasOwnProperty('complete')) {
            _o.onComplete.subscribe({next: func.complete});
        }
        return this;
    }

    /**
     * unsubscribes from this observer for object at path
     * @param path
     */
    unsubscribeFrom(path) {
        let _o = this.observerBuilder.get(path);
        if (!_o || _o === null) {
            _o.unsubscribe();
        }
    }

    /**
     * @returns {true|string} returns error string or true
     */
    validate() {
        const paths = _validPaths.get(this.jsd);
        try {
            Object.keys(paths).forEach((k) => {
                if (typeof paths[k] === "string") {
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
        let _ = _mdRef.get(this).path;
        return _exists(_) ? _ : "";
    }

    /**
     * getter for models parent Schema or Set element
     * @returns {Schema|Set}
     */
    get parent() {
        let _ = _mdRef.get(this).root;
        return _exists(_) ? _ : this;
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
}