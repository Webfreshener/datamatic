import {wf, _mdRef} from "./_references";
const _mData = new WeakMap();
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

        _data = Object.assign({}, _data, {
            _id: this._createID(),
            _className: _cName,
            _created: Date.now()
        });

        _mData.set(this, _data);
        _mdRef.set(this, this);
    }

    /**
     * @param {string} key
     */
    get(key) {
        let __ = _mData.get(this);
        return __.hasOwnProperty(key) ? __[key] : null;
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
        return this.get("_id");
    }

    /**
     * Root Schema element
     * @returns {Schema|Set}
     */
    get root() {
        return this.get("_root");
    }

    /**
     * Path to element
     * @returns {string}
     */
    get path() {
        return this.get("_path");
    }

    /**
     * Owner JSD document
     * @returns {JSD}
     */
    get jsd() {
        return this.get("_jsd");
    }

    /**
     * Getter for parent model
     * @returns {string | null}
     */
    get parent() {
        return this.get("_parent");
    }

    /**
     * Provides representation of Model as JSON string
     * @return {string}
     */
    toString() {
        return JSON.stringify(_mData.get(this));
    }
}
