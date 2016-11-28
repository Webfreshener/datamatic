/**
 * @class Schema
 */
class Schema {
	/**
	 * @constructor
	 * @param {Object} _o - schema definition object
	 * @param {Object} opts - schema options
	 */
	constructor(_signature, opts={extensible:false}) {
		var eMsg;
		_schemaOptions.set( this, opts );
		_validators.set( this, {} );
		_required_elements.set( this, [] );
		// traverses elements of schema
		if (_exists( _signature.elements )) {
			for (let _signatureE of Object.keys( _signature.elements )) {
				if (_exists( _signature.elements[_signatureE].required )) {
					_required_elements.get(this).push(_signatureE); }
			}	
		}
		// tests for metadata
		if (!(this instanceof _metaData)) {
			if ((arguments.length <= 2) || (_exists( arguments[2] ) && arguments[2] instanceof _metaData)) {
				_mdRef.set( this, new _metaData(this, { 
					_path: "", 
					_root: this
				}) ); }
			else {
				_mdRef.set( this, arguments[2]); }
		}
		// attempts to validate provided `schema` entries
		let _schema_validator = new SchemaValidator(_signature, this.options);
		// throws error if error messagereturned
		if (typeof (eMsg = _schema_validator.isValid()) === 'string') { 
			throw eMsg; }
		_schemaSignatures.set( this, _signature );
		_walkSchema( _signature.elements || {});
	}
	/**
	 * @returns schema signature object
	 */
	get signature() {
		return _schemaSignatures.get( this );
	}
	/**
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		let _ = _object.get(this);
		return _[key] || null;
	}
	/**
	 * sets value to schema key
	 * @param {string|object} key
	 * @param {any} value
	 */
	set(key, value) {
		var k;
		let _hasRequiredFields = (obj)=> {
			let oKeys = Object.keys( obj );
	        for (let key of this.requiredFields) {
	        	let _path = this.path.length ? this.path : "root element";
	        	if (oKeys.indexOf(key) === -1) {
	        		return `required property '${key}' is missing for '${_path}'`;	}	}
	        return true;
	    };
	    // -- handles objects passed in as key
	    if (typeof key === 'object') {
	      let _ = _hasRequiredFields(Object.assign({}, _object, key));
	      if (typeof _ === 'string') {
	      	return _; }
	      // calls set with nested key value pair
	      for (k in key) {
	        let _ = this.set(k, key[k]);
	        if (typeof _ === 'string') {
	          return _; } }
	    } 
	    // handles strings passed as key
	    else {
	      let _parent 		= this.parent;
	      let _parentPath 	= _parent.path;
	      let _o			= this.signature;
	      var _schema 		= _exists( _o.elements ) ? _o.elements : _o;
	      let _extensible 	= ( _exists(_o.extensible) ) ? _o.extensible : this.options.extensible || false;
	      let _pathKeys = key.split('.');
	      for (let k in _pathKeys) {
	    	let _elKey = _schema[ _pathKeys[k] ];
	        if (_exists(_elKey) && _elKey.hasOwnProperty('extensible')) { 
	      	  _extensible = _elKey.extensible; }
	        _schema = _exists(_schema.elements) ? _schema.elements[ _pathKeys[k] ] : _elKey;
	        let _key = (_exists(_parentPath) && _parentPath.length) ? `${_parentPath}.${_pathKeys[k]}` : _pathKeys[k];
	        if (!_exists(_schema)) {
	          if (!_extensible) { 
	          	return `element '${_pathKeys[k]}' is not a valid element`; }
	          _schema = { 
		            type: '*',
		            required: true,
		            extensible: false
		          };
	        }
	        if (typeof value === 'object') {
		      	let _s = (!Array.isArray( value )) ? new Schema( (_schema.elements || _schema), this.options) : _objHelper( _schema, this.options);
		      	if (typeof _s === 'string') {
		      		return `${s} at '${key}'`; }
				if (!_exists(_schema) || !_exists(_s) || typeof _s !== 'object') { 
					return `'${key}' was invalid`; }
				value = _s[(_s instanceof Vector) ? 'replaceAll' : 'set'](value);
				if (typeof value === 'string') { 
					return value; }
	        }
	        else {
	          if (key !== "_root") { // and @ instanceof _metaData
	        	let _ = _validate(_key, value);
	            if (typeof _ === 'string') { 
	          	  return _; }
	          }	}
	        let __o = {};
	        __o[key] = value;
	        _object.set(this, __o);
	      }
	    }
	    // returns self for chaining
	    return this;
	}
	/**
	 * @returns {true|string} returns error string or true
	 */
	validate() {
		var _path = this.path;
	    // return true
		for (let _k of ValidatorBuilder.getInstance().list()) {
			let e;
			_path = _path.length > 0 ? `${_path}.${_k}` : _k;
			if (typeof (e = _validate(_k, this.root.get(_k))) === 'string') { 
				return e; }
	    }
	    return true;       
	}
	get options() {
		return _schemaOptions.get(this);
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
		return _mdRef.get(this).path;
	}
	/**
	 * @returns {Schema} parent Schema element
	 */
	get parent() {
		return _mdRef.parent || this;
	}
	/**
	 * @returns list of required elements on this Schema
	 */
	get requiredFields() {
		return _required_elements.get( this );
	}
	/**
	 * indicates if Schema will accept arbitrary keys
	 * @returns {boolean}
	 */
	get isExtensible() {
		return this.options.extensible;
	}
};
/**
 * builds validations from SCHEMA ENTRIES
 * @private
 */
let _walkSchema = (obj, path)=> {
	let result = [];
	let _map = (itm,objPath)=> _walkSchema(itm, objPath);
	let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
    for (let _i in _elements) {
      let _k = _elements[_i];
      let itm;
      let objPath = (_exists(path) && 1 <= path.length) ? `${path}.${_k}` : _k;
      ValidatorBuilder.getInstance().create( obj[_k], objPath );
      // tests for nested elements
      if ((_exists(obj[_k])) && (typeof obj[_k].elements === 'object')) {
        if (!Array.isArray(obj[_k].elements)) {
          itm = _walkSchema(obj[_k].elements, objPath); } 
        else {
          itm = _map(obj[_k].elements, objPath); } }
      result.push( itm ); }
    return result;
};
/**
 * @private
 */
let _objHelper = function(_schema, opts) {
	var _kinds = _getKinds( _schema );
	if (Array.isArray( _kinds )) {
		_kinds = _kinds.map( function(itm) {
				  switch (typeof itm) {
				  	case "string":
				  		return itm;
				  		break;
				  	case "object":
				  		if (itm.hasOwnProperty('type')) {
				  			return itm.type;	}
				  		break;
				  }
				  return null;
				});
		_kinds = _kinds.filter( itm=> _exists(itm) );
		_kinds = _kinds.length ? _kinds : '*';
		return new Vector(_kinds || '*');
	}
	return null;
}
/**
 * @private
 */
let _validate = function(key, value) {
  var _list = ValidatorBuilder.getInstance().list();
  var _ref;
  // key = if value instanceof _metaData then value.get( '_path' ) else value.getpath
  // return "object provided was not a valid subclass of Schema" unless value instanceof Schema
  // return "object provided was malformed" unless typeof (key = value.getPath?()) is 'string'
  let msg;
  if (0 <= _list.indexOf(key)) {
    let _path = [];
    let iterable = key.split('.');
    var _p;
    for (let _k of iterable) {
      _path.push(_k);
      _p = _path.join('.');
      if (0 > _list.indexOf(_p)) { 
    	  _path.push('*'); }
    }
    if (!(_ref =  ValidatorBuilder.getInstance().get(_p))) {
      if (!this.options.extensible) { 
    	  return `'${key}' is not a valid schema property`; }
    }
    ValidatorBuilder.getInstance().set(key, _ref); 
  }
  if (typeof (msg = ValidatorBuilder.getInstance().exec(key, value)) === 'string') { 
	  return msg; }
  return true;  
};
/**
 * @private
 */
let _getKinds = (_s)=> {
  var _elems = Object.keys(_s).map(key=> {
    return _exists( _s[key].type ) ? _s[key].type : null; });
  _elems = _elems.filter(elem=> elem !== null);
  return _elems.length ? _elems : null;
};
