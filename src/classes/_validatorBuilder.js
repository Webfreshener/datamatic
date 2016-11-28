/**
 * @private
 */
let __vBuilder = null;
/**
 * @private
 */
class ValidatorBuilder {
	/**
	 * @constructor
	 */
  constructor() {
	if (!_exists( __vBuilder )) {
		_validators.set( (__vBuilder = this), {}); }
    return __vBuilder;
  }
  /**
   * @return list of validator paths
   */
  list() {
	  let _v = _validators.get(this);
	  return Object.keys( _v );
  }
  /**
   * @param path
   * @return item at path reference
   */
  get(path) {
	  let _v = _validators.get(this);
	  return _exists( _v[path] ) ? _v[path] : null;
  }
  /**
   * @param _path
   * @param func
   */
  set(_path, func) {
    if (!_exists(func) || typeof func !== 'function') { 
  	  return "2nd argument expects a function"; }
    let _v = _validators.get(this);
    _v[_path] = func;
    return this;
  }
  /**
   * @param {object} _ref
   * @param {string} _path
   */
  create(_ref, _path) {
	  let _v = [_ref];
	  if (!_exists( __vBuilder )) {
		  throw "ValidatorBuilder not properly initialized";	}
	  let __validators = _validators.get( this );
	  if (Array.isArray( _ref )) {
		  console.log(`${_path} is array`);
		  _v = _ref.map(_s => this.create(_s, _path));	}
	  return __validators[_path] = value=> {
	    for (let vItm of _v) {
	      let fName;
	      var _x;
	      if (vItm.required && !_exists(value)) { 
	    	  return `value for '${_path}' is required`; }
	      switch (typeof value) {
	        case 'string':
	          if (typeof vItm === 'object') { 
	        	  var _x = vItm.type != null ? vItm.type : null; }
	          if (typeof _x === 'undefined' || !_exists(_x)) { 
	        	  var _x = vItm; }
	          if (vItm !== 'String' && !_x.match(/^string$/i)) { 
	        	  return `${_path} requires ${_x} type was '<String>'`; }
	          if (_exists(vItm.restrict)) {
	            if (!_exists(new RegExp(vItm.restrict).exec(value))) { 
	            	return `value '${value}' for ${_path} did not match required expression`; } }
	          return true;
	          break;
	        case 'function':
	          _x = typeof vItm === 'string' ? vItm : _global.wf.wfUtils.Fun.getConstructorName(vItm);
	          return _x === _global.wf.wfUtils.Fun.getConstructorName(value);
	          break;
	        case 'object':
	          if (!Array.isArray( vItm) ) {
	            return __validators[_path](val); }
	          else {
	            for (var val = 0; val < value.length; val++) {
	              let e;
	              k = value[val];
	              if (typeof (e = __validators[_path](val)) === 'string') { 
	            	  return e; } }
	            return true; }
	          break;
	        case 'number':
	          _x = (vItm.type != null) && typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
	          if (!_exists( _x )) { 
	        	  _x = vItm;	}
	          if (_x === 'Number') { 
	        	  return true; }
	          if ((fName = _global.wf.wfUtils.Fun.getFunctionName(_x)) !== 'Number') { 
	        	  return `'${_path}' expected ${fName}, type was '<Number>'`; }
	          return !isNaN( new _x(value) );
	          break;
	        default:
	          _x = typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
	          if (Array.isArray(_x)) {
	        	let _ = _x.map( itm=> {
	        		let _clazz = _schemaroller_.getClass(itm);
	        		return (_exists(itm) && _exists(_clazz) && value instanceof _clazz);
	        	});
	        	return ( 0 <= _.indexOf(false) );	}
	          return (_exists(_x) && value instanceof _x);	}	}
	    // should have returned in the switch statement
	    return `unable to validate ${_path}`;
	  };
	}
  /**
   * executes validator `value` with validator at `path` 
   * @param _path
   * @param value
   */
  exec(_path, value){
	let _v = _validators.get(this);
    if (!_v.hasOwnProperty( _path )) { 
  	  return `validator for '${_path}' does not exist`; }
    return _v[_path](value);
  }
  static getInstance() {
	  return new this;
  }
}
