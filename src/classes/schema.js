/**
 * @class Schema
 */
class Schema {
  /**
   * @constructor
   * @param {Object} _o - schema definition object
   * @param {Object} opts - schema options
   */
  constructor(_o={}, opts={extensible:false}) {
    var eMsg;
    for (let _k of [_object, _mdRef, _validators]) {
    	_k.set(this, {}); }
    _required_elements.set( this, [] );
    // traverses elements of schema
    if (_exists( _o.elements )) {
      for (let _oE of Object.keys( _o.elements )) {
        if (_exists( _o.elements[_oE].required )) {
          _required_elements.get(this).push(_oE); }
      }
    }
    
    if (!(this instanceof _metaData)) {
        if ((arguments.length <= 2) || (_exists( arguments[2] ) && arguments[2] instanceof _metaData)) {
        	_mdRef.set( this, new _metaData(this, { _path: "", _root: this}) ); } 
        else {
        	_mdRef.set( this, arguments[2]); }
    }
    
    // attempts to validate provided `schema` entries
    let _schema_validator = new SchemaValidator(_o, opts);
    // throws error if error messagereturned
    if (typeof (eMsg = _schema_validator.isValid()) === 'string') { 
      throw eMsg; }
    // builds validations from SCHEMA ENTRIES
    let _walkSchema = (obj, path)=> {
      let _map = (itm,objPath)=> _walkSchema(item, objPath);
      return (() => {
        let result = [];
        for (let _k of ((Array.isArray(obj)) ? obj : Object.keys(obj))) {
          let item1;
          let objPath = _exists(path) && 1 <= path.length ? `${path}.${_k}` : _k;
          ValidatorBuilder.getInstance().create(obj[_k], objPath);
          if ((obj[_k].hasOwnProperty('elements')) && (typeof obj[_k].elements === 'object')) {
            if (!Array.isArray(obj[_k].elements)) {
              item1 = _walkSchema(obj[_k].elements, objPath); } 
            else {
              item1 = obj[_k].elements.map(_map(item,objPath)); } }
          result.push(item1); }
        return result; })(); };
	_walkSchema(_o.elements || {});
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
          _path[i] = _k;
          _p = _path.join('.');
          if (0 > _l.indexOf(_p)) { 
        	  _path[i] = '*'; }
        }
        
        if (!(_ref =  ValidatorBuilder.getInstance().get(_p))) {
          if (!opts.extensible) { 
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
  } // - end @constructor
  /**
   * @param {string} key
   * @returns {any}
   */
  get(key) {
	let __o = _object.get(this);
    return __o[key] || null;
  }
  /**
   * sets value to schema key
   * @param {string|object} key
   * @param {any} value
   */
  set(key, value) {
    var k;
    // -- handles objects passed in as key
    if (typeof key === 'object') {
      let _f = _hasRequiredFields(Object.assign({}, _object, key));
      if (typeof _f === 'string') {
      	return _f; }
      // calls set with nested key value pair
      for (k in key) {
        let eMsg = this.set(key[k], v);
        if (typeof eMsg  === 'string') {
          return eMsg; } }
    } 
    // handles strings passed as key
    else {
      let _parent = this.parent;
      let _parentPath = _parent.path;
      let _schema = ( exists(_o.elements) ) ? _o.elements : _o;
      let _extensible = ( exists(_o.extensible) ) ? _o.extensible : opts.extensible || false;
      var _elSchema;
      for (k of key.split('.')) {
        if (_exists(_elSchema[k]) && _elSchema[k].hasOwnProperty('extensible')) { 
      	  _extensible = _elSchema[k].extensible; }
        _elSchema = _exists(_elSchema.elements) ? _elSchema.elements[k] : _elSchema[k];
        let _key = (_exists(_parentPath) && _parentPath.length) ? `${_parentPath}.${k}` : k;
        if (!_exists(_elSchema)) {
          if (!_extensible) { 
          	return `element '${k}' is not a valid element`; }
          _elSchema = { 
            type: '*',
            required: true,
            extensible: false
          };
        }
        if (typeof value === 'object') {
      	let _s = _objHelper( value );
      	if (typeof _s === 'string') {
      		return `${s} at '${key}'`; }
          if (!_exists(_elSchema) || !_exists(_s) || typeof _s !== 'object') { 
            return `'${key}' was invalid`; }
          value = _s[(_s instanceof Vector) ? 'replaceAll' : 'set'](value);
          if (typeof value === 'string') { 
          	return value; }
        }
        else {
          if (key !== "_root") { // and @ instanceof _metaData
            if (typeof (eMsg = _validate(_key, value)) === 'string') { 
          	  return eMsg; }
          }
        }
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
    let _path = this.path;
    // return true
    for (let _k of ValidatorBuilder.getInstance().list()) {
      let e;
      _path = _path.length > 0 ? `${_path}.${_k}` : _k;
      if (typeof (e = _validate(_k, this.root.get(_k))) === 'string') { 
        return e; }
    }
    return true;       
  };
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
	  return _mdRef.path;
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
	  return _schemaOptions.get(this).extensible;
  }
}
