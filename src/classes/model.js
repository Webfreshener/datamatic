import {_mdRef, _oBuilders, _vBuilders, _exists, _validPaths} from './_references';
import {Schema} from './schema';
import {Set} from './set';
import {JSD} from './jsd';
export class Model {
    /**
     * subscribes handler method to observer for model
     * @param func
     * @returns {Model}
     */
    subscribe(func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribe requires function');
        }
        let _o = this.observerBuilder.get(this.path);
        if (!_o || _o === null) {
            this.observerBuilder.create(this.path, this);
            _o = this.observerBuilder.get(this.path);
        }
        _o.subscribe(func);
        return this;
    }

    /**
     * unsubscribes from this object's observer
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
     */
    subscribeTo(path, func) {
        if ((typeof func).match(/^(function|object)$/) === null) {
            throw new Error('subscribeTo requires function');
        }
        let _o = this.observerBuilder.get(path);
        if (!_o || _o === null) {
            this.observerBuilder.create(path, this);
            _o = this.observerBuilder.get(path);
        }
        _o.subscribe(func);
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
                if (typeof paths[k] === 'string') {
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
        return (typeof this.validate() !== 'string');
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
     * JSON stringifies primitive value
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
     * @returns {Schema} elemetn at Schema root
     */
    get root() {
        return _mdRef.get(this).root || this;
    }

    /**
     * @returns {string} path to current Schema
     */
    get path() {
        let _ = _mdRef.get(this).path;
        return _exists(_) ? _ : "";
    }

    /**
     * @returns {Schema} parent Schema element
     */
    get parent() {
        let _ = _mdRef.get(this).root;
        return _exists(_) ? _ : this;
    }

    /**
     * @returns {*|JSD}
     */
    get jsd() {
        return _mdRef.get(this).jsd;
    }

    /**
     *
     * @returns {ValidatorBuilder}
     */
    get validatorBuilder() {
        return _vBuilders.get(this.jsd);
    }

    get observerBuilder() {
        return _oBuilders.get(this.jsd);
    }
}