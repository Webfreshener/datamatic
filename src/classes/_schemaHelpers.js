/**
 * @private
 */
class SchemaHelpers {
	/**
	 * @constructor
	 */
	constructor(_ref) {
		if (!_exists(_ref) || !(_ref instanceof Schema)) {
			throw "arguments[0] must be type 'Schema'"; }
		this._ref = _ref;
	}
	/**
	 * 
	 */
	setObject( obj ) {
		obj = this.ensureRequiredFields(obj);
		if (typeof obj === 'string') {
			return obj; }
		// calls set with nested key value pair
		for (var k in obj) {
			let eMsg = this._ref.set(k, obj[k]);
			if (typeof eMsg  === 'string') { 
				return eMsg; }
		}
		return this._ref;
	}
	/**
	 * 
	 */
	setChildObject(key, value) {
        let _mdData = {
      		  _path: key, //`${this._ref.path}.${key}`,
      		  _root: this._ref.root
      		  };
        let _s = this.createSchemaChild(key, value, this._ref.options, _mdData);
        if (!_exists(_s) || typeof _s !== "object") {
      	  return `'${key}' was invalid`; }
        return _s[(_s instanceof Vector) ? "replaceAll" : "set"](value);
	}
	/**
	 * @param {Object} itm
	 * @returns {String|false}
	 */
	ensureKindIsString(itm) {
	    switch (typeof itm) {
	      case 'string':
	        return itm;
	      case 'object':
	        if (itm.hasOwnProperty('type')) {
	        	return this.ensureKindIsString( itm.type ); }
	        break;
	    }
	    return false;
	}
	/**
	 * tests if required fields exist on object
	 * @param {Object} obj
	 * @returns {true|string} - returns true or error string
	 */
    ensureRequiredFields(obj) {
      let oKeys = Object.keys( obj );
      let _required = this._ref.requiredFields
      for (let _ in _required) {
    	let _key = _required[_];
    	let _path = this._ref.path.length ? this._ref.path : "root element";
        if (0 > oKeys.indexOf( _key )) {
        	if (_exists(this._ref.signature[_key].default)) {
        		obj[_key] = this._ref.signature[_key].default;
        	} else {
        		return `required property '${_key}' is missing for '${_path}'`;	}
        	}}
      return obj;
    }
	/**
	 * @param {Object} value
	 * @param {_metaData} metaData
	 */
	createSchemaChild(key, value, opts, metaData) {
	  var _kinds;
	  // tests if value is not Array
	  if (!Array.isArray(value)) {
	      let _md = new _metaData(this._ref, metaData || {
	    	  _path: key,//`${this._ref.path}.${key}`,
	    	  _root: this._ref.root
	      });
	      let _schemaDef = this._ref.signature[key] || this._ref.signature['*'] || this._ref.signature;
	      return new Schema( _schemaDef, opts, _md); }
	  else {
		  _kinds = this.getKinds( this._ref.signature[key] || this._ref.signature );
	      if (Array.isArray(_kinds)) {
	        _kinds = _kinds.map( this.ensureKindIsString( value ) );
	        _kinds = _kinds.filter( itm=> itm !== null );
	        _kinds = _kinds.length ? _kinds : '*';
	        return new Vector((_kinds || '*'), metaData); }
	  }
	  return "unable to process value";
	}
	/**
	 * builds validations from SCHEMA ENTRIES
	 * @private
	 */
	walkSchema(obj, path) {
		let result = [];
		let _map = function(itm,objPath) {
			return _walkSchema(itm, objPath);	};
		let _elements = Array.isArray(obj) ? obj : Object.keys(obj);
	    for (let _i in _elements) {
	      let _k = _elements[_i];
	      let itm;
	      let objPath = _exists(path) ? (path.length ? `${path}.${_k}` : _k) : _k || "";
	      ValidatorBuilder.getInstance().create( obj[_k], objPath );
	      // tests for nested elements
	      if (_exists(obj[_k]) && typeof obj[_k].elements === "object") {
	    	  
	        if (!Array.isArray(obj[_k].elements)) {
	        	result.push( this.walkSchema(obj[_k].elements, objPath) ); } 
	        else {
	        	result.push( _map(obj[_k].elements, objPath) ); } 
	        }
	    }
	    return result;
	}
	/**
	 * @private
	 */
	objHelper(_schema, opts) {
		var _kinds = this.getKinds( _schema );
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
	 * @param {string} key
	 * @param {object} object to validate
	 */
	validate(key, value) {
	  var _list = ValidatorBuilder.getInstance().list();
	  var _ref;
	  //-- attempts to validate
	  if (!key.length) { // and @ instanceof _metaData
  		return `invalid path '${key}'`;	}
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
	}
	/**
	 * @returns {array} list of types decalred by object
	 */
	getKinds(_s) {
	  var _elems = Object.keys(_s).map(key=> {
		  return (key === "type") ? _s.type : _exists( _s[key].type ) ? _s[key].type : null; });
	  _elems = _elems.filter(elem=> elem !== null );
	  return _elems.length ? _elems : null;
	}
}
