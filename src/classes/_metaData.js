import {wf, _mdRef} from "./_references";
// import {Schema} from "./schema";
// import {Set} from "./set";
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

        // ensures existance of writeLock param
        if (!_data.hasOwnProperty("_writeLock") || _data._writeLock === void(0)) {
            _data._writeLock = false;
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
     * path to parent element
     * @returns {string}
     */
    get parent() {
        let _ = this.path || "";
        let _p = _.split(".");
        _p = (_p.length > 1) ? _p.slice(0, _p.length - 2).join(".") : _p[0];
        return _p.length ? this.root.get(_p) : this.root;
    }

    /**
     *
     * @returns {*}
     */
    get writeLock() {
        return this.get("_writeLock");
    }

    toString() {
        return JSON.stringify(_mData.get(this));
    }
}
