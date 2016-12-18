/**
 * @private
 */
class SchemaHelpers {
	/**
	 * @constructor
	 */
	constructor(_ref) {
//		if (!_exists(ref) || !(ref instanceof Schema)) {
//			throw "arguments[0] must be type 'Schema'"; }
		this._ref = _ref;
	}
	/**
	 * 
	 */
	setObject( obj ) {
		let _ = this.hasRequiredFields( Object.assign({}, _object, obj) );
		if (typeof _ === "string") {
			return _; }
		// calls set with nested key value pair
		for (var k in obj) {
			let eMsg = this._ref.set(k, obj[k]);
			if (typeof eMsg  === "string") { 
				return eMsg; }
		}
		return this._ref;
	}
	/**
	 * @param {Object} itm
	 * @returns {String|false}
	 */
	ensureKindIsString(itm) {
	    switch (typeof itm) {
	      case "string":
	        return itm;
	      case "object":
	        if (itm.hasOwnProperty("type")) {
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
    hasRequiredFields(obj) {
      let oKeys = Object.keys( obj );
      let _required = this._ref.requiredFields
      for (let _ in _required) {
    	let _key = _required[_];
    	let _path = this._ref.path.length ? this._ref.path : "root element";
        if (0 > oKeys.indexOf( _key )) {
          return `required property '${_key}' is missing for '${_path}'`;}}
      return true;
    }
	/**
	 * @param {Object} value
	 * @param {_metaData} metaData
	 */
	createSchemaChild(key, opts, metaData) {
	  var _kinds;
//	  console.log(`this._ref.signature for ${key}:\n${JSON.stringify( this._ref.signature , null, 2)}`);
	  let _schemaDef = _exists( this._ref.signature.elements ) ? this._ref.signature.elements : this._ref.signature["*"] || this._ref.signature
	  console.log(`_schemaDef ${key}: ${JSON.stringify(_schemaDef)}`);
	  // tests if value is not Array
//	  if (!Array.isArray(value)) {
//		  console.log(`${key} is object`)
//	      let _md = new _metaData(this._ref, {
//	    	  _path: key,
//	    	  _root: this._ref.root
//	      });
//	      
//	      
//	      console.log(`_schemaDef ${key}: ${JSON.stringify(_schemaDef)}`);
//	      return new Schema( _schemaDef, opts, metaData); }
//	  else {
//		  console.log(`createSchemaChild: ${key}`);
//		  let _sig = this._ref.signature[key] || this._ref.signature["*"] || this._ref.signature;
//		  console.log(`_sig: ${JSON.stringify(_sig)}`);
//		  _kinds = this.getKinds(_sig);//( this._ref.signature[key] || this._ref.signature );
//		  console.log(`_kinds: ${JSON.stringify(_kinds)}`);
//	      if (Array.isArray(_kinds)) {
////	        _kinds = _kinds.map( this.ensureKindIsString( value ) );
//	        _kinds = _kinds.filter( itm=> itm !== null );
//	        _kinds = _kinds.length ? _kinds : "*";
//	        return new Vector((_kinds || "*"), metaData); }
//	  }
	  return "unable to process value";
	}
	/**
	 * 
	 */
	setChildObject(key, schema, value) {
        let _mdData = {
      		  _path: key,
      		  _root: this._ref.root
      		  };
        console.log(`setChildObject for ${key}`);
        let _schema = schema["*"] || schema;
        // _schema.polymorphic || _schema ?????
        let _s = this.createSchemaChild(key, this._ref.options, _mdData);
        if (typeof _s === "string") {
        	return _s }
        if (!_exists(schema) || !_exists(_s) || typeof _s !== "object") {
      	  return `child object '${key}' was invalid`; }
        return _s[(_s instanceof Vector) ? "replaceAll" : "set"](value);
	}
	/**
	 * builds validations from SCHEMA ENTRIES
	 * @private
	 */
	walkSchema(schema, path) {
		let result = [];
		let _map = (_schema, _path)=> {
			return this.walkSchema(_schema, _path);	};
		let _elements = Array.isArray(schema) ? schema : Object.keys(schema);
	    for (let _i in _elements) {
	      let _key = _elements[_i];
	      let _signature = schema[_key];
	      let schemaPath = _exists(path) ? (path.length ? `${path}.${_key}` : _key) : _key || "";
	      console.log(`_key: ${_key} schemaPath: ${schemaPath}\n_signature: ${JSON.stringify(_signature.polymorphic || _signature)}`);
	      if (_signature.polymorphic) {
	    	  let _polySig = _signature.polymorphic;
	    	  ValidatorBuilder.getInstance().create( _polySig, schemaPath );
	    	  for (let _ in _polySig) {
	    		  result.push( _map(_polySig[_], schemaPath) );
	    	  }
	      } else {
		      ValidatorBuilder.getInstance().create( _signature, schemaPath );
		      // tests for nested elements
		      if (_exists(_signature.elements) && typeof _signature.elements === "object") {
		        if (!Array.isArray(_signature.elements)) {
		        	result.push( this.walkSchema(_signature.elements, schemaPath) ); } 
		        else {
		        	result.push( _map(_signature.elements, schemaPath) ); }
		        }
	      } }
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
					  		if (itm.hasOwnProperty("type")) {
					  			return itm.type;	}
					  		break;
					  }
					  return null;
					});
			_kinds = _kinds.filter( itm=> _exists(itm) );
			_kinds = _kinds.length ? _kinds : "*";
			return new Vector(_kinds || "*");
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
	  // return "object provided was malformed" unless typeof (key = value.getPath?()) is "string"
	  let msg;
	  if (0 <= _list.indexOf(key)) {
	    let _path = [];
	    let iterable = key.split(".");
	    var _p;
	    for (let _k of iterable) {
	      _path.push(_k);
	      _p = _path.join(".");
	      if (0 > _list.indexOf(_p)) { 
	    	  _path.push("*"); }
	    }
	    if (!(_ref =  ValidatorBuilder.getInstance().get(_p))) {
	      if (!this.options.extensible) { 
	    	  return `'${key}' is not a valid schema property`; }
	    }
	    ValidatorBuilder.getInstance().set(key, _ref); 
	  }
	  if (typeof (msg = ValidatorBuilder.getInstance().exec(key, value)) === "string") { 
		  return msg; }
	  return true;  
	}
	/**
	 * @returns {array} list of types decalred by object
	 */
	getKinds(_s) {
	  var _elems;
	  _s = !_exists(_s.polymorphic) ? _s : _s.polymorphic;
	  _elems = Object.keys(_s).map(key=> {
		  return (key === "type") ? _s.type : _exists( _s[key].type ) ? _s[key].type : null; });
	  _elems = _elems.filter(elem=> elem !== null );
	  return _elems.length ? _elems : null;
	}
}
