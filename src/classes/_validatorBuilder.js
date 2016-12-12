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
   * @returns list of validation paths
   */
  list() {
	  let _v = _validators.get(this);
	  return Object.keys( _v );
  }
  /**
   * @param path
   * @returns item at path reference
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
    _validators.get(this)[_path] = func;
    return this;
  }
  /**
   * @param {object} _ref
   * @param {string} _path
   */
  create(ref, path) {
	  if (!_exists(ref)) {
		  throw "create requires object reference at arguments[0]";	}
	  let _signatures = _exists(ref.polymorphic) ? ref.polymorphic : [ref];
//	  console.log(`create on ${path} ${JSON.stringify(_signatures)}`);
//	  console.log(this.list());
	  return _validators.get( this )[path] = value=> {
		  let _typeof	= _global.wf.wfUtils.Str.capitalize(typeof value);
		  let _hasKey	= (0 <= Object.keys(Validator).indexOf( _typeof ));
		  let _validator = new Validator[ _hasKey ? _typeof : "Default"](path, _signatures);
	      return _validator.exec(value);
	  };
	}
	  
  /**
   * executes validator `value` with validator at `path` 
   * @param path
   * @param value
   */
  exec(path, value) {
	  let _v = _validators.get(this);
	  if (!_v.hasOwnProperty( path )) {
		  return `validator for '${path}' does not exist`; }
	  return _v[path]( value );
  }
  /**
   * @returns singleton ValidatorBuilder reference
   */
  static getInstance() {
	  return new this;
  }
  /**
   * @returns validators WeakMap
   */
  static getValidators() {
	  return _validators.get( ValidatorBuilder.getInstance() );
  }
}
