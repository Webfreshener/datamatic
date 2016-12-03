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
		_object.set(this, {});
		_schemaOptions.set( this, opts );
		_validators.set( this, {} );
		_required_elements.set( this, [] );

		// traverses elements of schema
		if (_exists( _signature.elements )) {
			for (let _sigEl of Object.keys( _signature.elements )) {
				// -- tests for element `required`
				let _req = _signature.elements[_sigEl].required
				if ( _req ) {
					// -- adds required element to list
					_required_elements.get(this).push( _sigEl ); }
			}	
		}
		// tests for metadata
//		if (!(this instanceof _metaData)) {
//			if (_exists( arguments[2] ) && arguments[2] instanceof _metaData) {
//				console.log(arguments[2]);
//				_mdRef.set( this, arguments[2]);	}
//			else {
//				_mdRef.set( this, new _metaData(this, { 
//					_path: "", 
//					_root: this
//				}) ); 
//			}}
		if (!(this instanceof _metaData)) {
			let _;
			if ( !_exists( arguments[2] ) ) {
				_ = new _metaData(this, { 
					_path: "", 
					_root: this });	}
			else {
				_ = (arguments[2] instanceof _metaData) ? arguments[2] : new _metaData( this, arguments[2] ); }
			_mdRef.set( this, _ );
		}
//		console.log(_mdRef.get( this ));
		// attempts to validate provided `schema` entries
		let _schema_validator = new SchemaValidator(_signature, this.options);
		// throws error if error messagereturned
		if (typeof (eMsg = _schema_validator.isValid()) === 'string') { 
			throw eMsg; }
		_schemaSignatures.set( this, _signature );
		_walkSchema( _signature.elements || _signature || {});
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
    	let _hasRequiredFields = (obj)=> {
			let oKeys = Object.keys( obj );
	        for (let key of this.requiredFields) {
	        	let _path = this.path.length ? this.path : "root element";
	        	if (oKeys.indexOf(key) === -1) {
	        		return `required property '${key}' is missing for '${_path}'`;	}	}
	        return true;
	    };
	    if (typeof key === 'object') {
	      let _f;
	      if (typeof (_f = _hasRequiredFields(Object.assign({}, _object, key))) === 'string') {
	    	  return _f; }
	      // calls set with nested key value pair
	      for (var k in key) {
	        let v = key[k];
	        var eMsg = this.set(k, v);
	        if (typeof eMsg  === 'string') { 
	        	return eMsg; }
	      }
	    }
	    else {
//	      let _childSigs = _exists(this.signature.elements) ? 
//	    		  this.signature.elements : _exists(this.signature.polymorphic) ? 
//	    					this.signature.polymorphic : this.signature;
	      let _childSigs  = this.signature.elements || this.signature;
	      let _extensible = _exists(this.signature.extensible) ? this.signature.extensible : this.options.extensible || false;
	      let _pathKeys = key.split('.');
	      for (let _ in _pathKeys) {
	    	let k = _pathKeys[_];
	    	console.log(`\n\n${k} signature: ${JSON.stringify(_childSigs, null, 2)}`);
	    	let _key = this.path.length > 0 ? `${this.path}.${k}` : k;
	        if (_exists(_childSigs[k]) && _exists(_childSigs[k].extensible)) { 
	        	_extensible = _childSigs[k].extensible; }
	        let _schema = _exists(_childSigs[k]) ? (_exists(_childSigs[k].elements) ? _childSigs[k].elements : _childSigs[k].polymorphic) || _childSigs;
	        if (!_exists( _schema )) {
	          if (!_extensible) { 
	        	  return `element '${k}' is not a valid element`; }
	          _schema = { 
	            type: '*',
	            required: true,
	            extensible: false
	          };
	        }
	        if (typeof value === 'object') {
	          let _mdData = {
	        		  _path: _key,
	        		  _root: this.root
	        		  };
//	          console.log(`\n\n${_key} _mdData: ${JSON.stringify(_mdData)}`);
//	          if (!Array.isArray(value)) {
	          if (_schema.type !== 'Array' && !Array.isArray(value)) {
	            let _opts = {extensible: _extensible};
	            let __s = {
	            			elements: _exists(_schema.elements) ? _schema.elements: _schema	};
//		        console.log(`k: ${k} ${_key} _schema: ${JSON.stringify( __s)}`);
//		        console.log(ValidatorBuilder.getInstance().list());
	            var _s = new Schema(__s, _opts, _mdData);
	          }
	          else {
	            let _kinds = _getKinds( _schema );
	            if (Array.isArray( _kinds )) {
	              _kinds = _kinds.map(function(itm){
	                switch (typeof itm) {
	                  case 'string':
	                    return itm;
	                  case 'object':
	                    if (itm.hasOwnProperty('type')) { return itm.type; }
	                    break;
	                }
	              });
	              _kinds = _kinds.filter(itm=> itm != null);
	              _kinds = _kinds.length ? _kinds : '*';
	              var _s = new Vector( _kinds, _mdData );
	            }
	          }
	          if (!_exists(_schema) || !_exists(_s) || typeof _s !== 'object') {
	        	  return `'${key}' was invalid`; }
	          value = _s[(_s instanceof Vector) ? 'replaceAll' : 'set'](value);
	          if (typeof value === 'string') { return value; }
	        } 
	        else {
	          if (_key.length) { // and @ instanceof _metaData
	            let eMsg = _validate(_key, value)
	            if (typeof eMsg === 'string') { 
	            	return eMsg; }
	          }
	        }
          let _o = _object.get(this);
          _o[key] = value;
          _object.set(this, _o);
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
	/**
	 * 
	 */
	valueOf() {
		return _object.get(this);
	}
	/**
	 * 
	 */
	toJSON() {
		let _o = {};
		let _derive = function(itm) {
			if (itm instanceof Schema) {
				return _derive( itm.toJSON() );	}
			if (itm instanceof Vector) {
				let _arr = [];
				for (let k of itm.valueOf()) {
					_arr.push( _derive( itm[k] ) );
					return _arr;
				}
			}
			return itm;
		};
		let _obj = _object.get( this );
		for (let k in _obj) {
			_o[k] = _derive( _obj[k] );
		}
		return _o;
		}
	/**
	 * 
	 */
	toString(pretty=false) {
		return JSON.stringify(this.toJSON(), null, (pretty ? 2 : void(0)));
		}
	/**
	 * 
	 */
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
		let _ = _mdRef.get(this).root;
		return _exists(_) ? _ : this;
		}
	/**
	 * @returns {string} path to current Schema
	 */
	get path() {
		let _ = _mdRef.get(this).path;
		return _exists(_) ? _ :  "";
		}
	/**
	 * @returns {Schema} parent Schema element
	 */
	get parent() {
		let _ = _mdRef.get(this).root;
		return _exists(_) ? _ : this;
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
	console.log(`_walkSchema for ${path}`);
	//console.log(obj);
	let result = [];
	let _map = function(itm,objPath) {
		return _walkSchema(itm, objPath);	};
	let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
    for (let _i in _elements) {
      let _k = _elements[_i];
      let itm;
      let objPath = _exists(path) ? (path.length ? `${path}.${_k}` : _k) : _k || '';
      ValidatorBuilder.getInstance().create( obj[_k], objPath );
      // tests for nested elements
      if (_exists(obj[_k]) && typeof obj[_k].elements === 'object') {
        if (!Array.isArray(obj[_k].elements)) {
          itm = _walkSchema(obj[_k].elements, objPath); } 
        else {
          itm = _map(obj[_k].elements, objPath); } }
      else {
//    	  console.log(`obj[${_k}]: ${JSON.stringify(obj[_k])}`);  
      }
//      if ( _exists(obj[_k].polymorphic)) {
////    	  console.log(`objPath: ${objPath}`);
//    	  itm = _walkSchema(obj[_k].polymorphic, objPath);	}
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
	  return (key === "type") ? _s.type : _exists( _s[key].type ) ? _s[key].type : null; });
  _elems = _elems.filter(elem=> elem !== null );
  return _elems.length ? _elems : null;
};
