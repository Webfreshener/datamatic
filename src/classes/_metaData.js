import {wf, _mdRef} from './_references';
import {Schema} from './schema';
import {Set} from './set';
/**
 * @private
 */
export class MetaData {
    /**
     * @constructor
     * @param {Schema|Set} _oRef -- Object Reference to item being described
     * @param {object} _data -- Initial Data {parent:Schema|Set}
     */
    constructor(_oRef, _data = {}) {
        let _cName = wf.Fun.getConstructorName(_oRef);
        if (!(_oRef instanceof Schema) && !(_oRef instanceof Set)) {
            throw `new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<${_cName}>'`;
        }
        if (this._createID == null) {
            let _id = 0;
            MetaData.prototype._createID = function () {
                if (this.__objID == null) {
                    _id = _id + 1;
                    this.__objID = `${_cName}${_id}`;
                }
                return this.__objID;
            };
        }
        _data = Object.assign(_data, {
            _id: this._createID(),
            _className: _cName,
            _created: Date.now()
        });
        _mdRef.set(this, _data);
        _mdRef.set(_oRef, _data);
    }

    /**
     * @param {string} key
     */
    get(key) {
        let _ = _mdRef.get(this);
        return _.hasOwnProperty(key) ? _[key] : null;
    }

    /**
     * not implemented
     */
    set() {
        return this;
    }

    /**
     * UUID of element
     * @returns {string} Unique ObjectID
     */
    get objectID() {
        return this.get('_id');
    }

    /**
     * Root Schema element
     * @returns {Schema|Set}
     */
    get root() {
        return this.get('_root');
    }

    /**
     * Path to element
     * @returns {string}
     */
    get path() {
        return this.get('_path');
    }

    /**
     * Owner JSD document
     * @returns {JSD}
     */
    get jsd() {
        return this.get('_jsd');
    }

    /**
     * @returns {string} path to Element
     */
    get parent() {
        let _ = this.path || "";
        var _p = _.split('.');
        _p = (_p.length > 1) ? _p.slice(0, _p.length - 2).join('.') : _p[0];
        console.log(`parent: ${_p}`);
        return _p.length ? this.root.get(_p) : this.root;
    }
}
