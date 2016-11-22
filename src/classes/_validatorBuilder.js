/**
 * @private
 */
class ValidatorBuilder {
  constructor() {
    let _validators = {};
    /**
     * @private
     * @param: _ref:Object
     * @params _path:String
     */
    let _buildValidator = (_ref, _path)=> {
      let _v = [_ref];
      if (Array.isArray(_ref)) {
        _v = _ref.map(_s => _buildValidator(_s, _path));
      }
      return _validators[_path] = value=> {
        for (let vItm of _v) {
          let fName;
          if (vItm.required && (value == null)) { 
        	  return `value for '${_path}' is required`; }
          switch (typeof value) {
            case 'string':
              if (typeof vItm === 'object') { 
            	  var _x = vItm.type != null ? vItm.type : null; }
              if (typeof _x === 'undefined' || _x === null) { 
            	  var _x = vItm; }
              if (vItm !== 'String' && !_x.match(/^string$/i)) { 
            	  return `${_path} requires ${_x} type 'String'`; }
              if (vItm.restrict != null) {
                if (!_exists(new RegExp(vItm.restrict).exec(value))) { 
                	return `value '${value}' for ${_path} did not match required expression`; } }
              return true;
              break;
            case 'function':
              var _x = typeof vItm === 'string' ? vItm : _global.wf.wfUtils.Fun.getConstructorName(vItm);
              return _x === _global.wf.wfUtils.Fun.getConstructorName(value);
              break;
            case 'object':
              if (!Array.isArray(vItm)) {
                return _validators[`${_path}`](val);
                return _validators[_path](val);
              }
              else {
                for (var val = 0; val < value.length; val++) {
                  let e;
                  k = value[val];
                  if (typeof (e = _validators[_path](val)) === 'string') { 
                	  return e; } }
                return true; }
              break;
            case 'number':
              _x = (vItm.type != null) && typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
              if (typeof _x === 'undefined' || _x === null) { 
            	  _x = vItm; 
              }
              if (_x === 'Number') { 
            	  return true; }
              if ((fName = _global.wf.wfUtils.Fun.getFunctionName(_x)) !== 'Number') { 
            	  return `'${_path}' expected ${fName}, type was '<Number>'`; }
              return !isNaN(new _x(value));
              break;
            default:
              _x = typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
              return ((_x != null) && value instanceof _x);
          }
        }
        // should not be here
        return `unable to validate ${_path}`;
      };
    };
    /**
     * list
     * @return list of validator paths
     */
    this.list = () => Object.keys(_validators);
    /**
     * get
     * @param path
     * @return item at path reference
     */
    this.get = path=> _validators[path] != null ? _validators[path] : null;
    /**
     * set
     * @param _path
     * @param func
     */
    this.set = function(_path, func){
      if ((func == null) || typeof func !== 'function') { 
    	  return "2nd argument expects a function"; }
      return _validators[_path] = func;
    };
    /**
     * create
     * @param _ref
     * @param _path
     */
    this.create = function(_ref, _path){
      return _buildValidator.apply(this, arguments);
    };
    /**
     * exec
     * @param _path
     * @param value
     */
    this.exec = function(_path, value){
      if (!_validators.hasOwnProperty(_path)) { 
    	  return `validator for '${_path}' does not exist`; }
      return _validators[_path](value);
    };
  }
  static getInstance() {
    return this.__instance != null ? this.__instance : (this.__instance = new this);
  }
}
