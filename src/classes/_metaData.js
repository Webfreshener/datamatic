/**
 * @private
 */
class _metaData {
	/**
	 * @constructor
	 * @param {Schema|Set} _oRef - Object Reference to item being described
	 * @param {object} _data -- Initial Data {parent:Schema|Set}
	 */
	constructor(_oRef, _data={}) {
		let _cName = _global.wf.Fun.getConstructorName( _oRef );
		if (!(_oRef instanceof Schema || _oRef instanceof Set)) {
	    	throw `new _metaData() argument 1 requires subclass Schema or Set. Was subclass of '<${_cName}>'`;
	    }
	    if (this._createID == null) {
	      let _id = 0;
	      _metaData.prototype._createID = function() {
	        if (this.__objID == null) { 
	        	this.__objID = `${_cName}${_id + 1}`; }
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
		let _ = _mdRef.get( this );
		return _.hasOwnProperty(key) ? _[key] : null;
	}
	/**
	 * not implemented
	 */
	set() {
		return this; 
	}
	/**
	 * @returns {string} Unique ObjectID
	 */
	get objectID() {
		return this.get('_id');
	}
	/**
	 * @returns {Schema|Set} root Schema Element
	 */
	get root() {
		return this.get('_root');
	}
	/**
	 * @returns {string} path to Element
	 */
	get path() {
		return this.get('_path');
	}
	/**
	 * @returns {string} path to Element
	 */
	get parent() {
		let _ = this.path || "";
		var _p = _.split('.');
		_p =  (_p.length > 1) ? _p.slice(0, _p.length - 2).join('.') : _p[0];
		return (_p.length > 0) ? this.root.get( _p ) : this.root;
	}
}
