class SchemaValidator {
  constructor(_schema = {}, opts={extensible:false}){
    this.opts = opts;
    let _errorMsg = null;
    this.isValid = () => _errorMsg || true;
    // validates SCHEMA ENTRIES
    for (let _oKey of Object.keys(_schema)) {
      switch (typeof _schema[_oKey]) {
        case "string":
          let obj = {};
          obj[_oKey] = {
            type: _global.wf.wfUtils.Str.capitalize(_schema[_oKey], 
            {required: false})
          };
          let _o = Object.assign(_schema, obj);
          _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
          break;
        case "object":
          if (!Array.isArray(_schema[_oKey])) {
            if (_oKey !== 'elements') {
              _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
            } else {
              for (let xKey of Object.keys(_schema[_oKey])) {
                if (typeof (_errorMsg = this.validateSchemaEntry(xKey, _schema[_oKey][xKey])) === 'string') { return _errorMsg; }
              }
            }
          } else {
            for (let _s of _schema[_oKey]) {
              if (typeof _schema[_oKey][_s] === 'string') {
                _errorMsg = this.validateTypeString(_oKey, _schema[_oKey][_s]);
              } else {
                _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey][_s]);
              }
            }
          }
          break;
        case "boolean":
          _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
          break;
        default:
          _errorMsg = `value for schema element '${_oKey}' was invalid`;
      }
    }
    _errorMsg;   
  }
  validateTypeString(key, _type){
    if (key.match(/\.?default+$/)) { return true; }
    if (key.match(/\.restrict+$/)) {
      if (typeof _type !== 'string') { return 'restrict requires a Regular Expression String'; }
      try { "text".match(new RegExp(_type)); }
      catch (e) {
        if (!_type.match(_schemaroller_.rx)) { return `Regular Expression provided for '${key}' was invalid`; }
      }
    } else if (((_schemaroller_.getClass(_global.wf.wfUtils.Str.capitalize(_type))) != null) === false) {
      return `type '<${_type}>' for schema element '${key}' was invalid`;
    }
    return true;
  }
  validateSchemaEntry(key, params, opts){
    if (typeof opts === 'undefined' || opts === null) { ({ opts } = this); }
    let _schemaKeys = _schemaroller_.schemaRef;
    if (params == null) { return `${key} was null or undefined`; }
    if (typeof params === 'boolean') { return true; }
    if (typeof params === 'string') { return this.validateTypeString(`${key}`, params); }
    if (typeof params === 'object') {
      if (!params.hasOwnProperty("type")) {
        if (Array.isArray(params)) {
          for (let item of params) {
            var _res;
            if (typeof (_res = this.validateSchemaEntry(key, item)) === 'string') { return _res; }
          }
        } else {
          let _p;
          let keyPath;
          if ((_p = (keyPath = key.split('.')).pop()) !== 'elements') { 
            if (_p === 'default') { return true; }
            return `value for schema element '${key}' was malformed. Property 'type' was missing`;
          } else {
            for (let param of Object.keys(params)) {
              var _res;
              let _keys = [].concat( keyPath ).concat(param);
              if (typeof (_res = this.validateSchemaEntry(`${_keys.join('.')}`, params[param])) === 'string') { return _res; }
            }
          }
        }
        return true;
      }
      if ((_schemaroller_.getClass(params.type)) == null) {
        if (params.type === '*') { return true; }
        if (Object.keys(params).length === 0) { return true; }
        if (typeof params.type === 'object') { return this.validateSchemaEntry(key, params.type); }
        if (key.split('.').pop() === 'default') {
          if (this._defaults == null) { this._defaults = {}; }
          this._defaults[key] = params;
          return true;
        }
        return `value for schema element '${key}' has invalid type '<${params.type}>'`;
      }
      for (let sKey of Object.keys(params)) {
        if ((_schemaKeys[sKey] == null) && !opts.extensible) { return `schema element '${key}.${sKey}' is not allowed`; }
        if (typeof params[sKey] === "string") {
          var eMsg;
          let _kind = _global.wf.wfUtils.Str.capitalize(params[sKey]);
          if (sKey === 'restrict') {
            try {
              new RegExp(params[sKey]);
            } catch (e) {
              return e;
            }
            return true;
          }
          if ((_schemaKeys[sKey] == null) && !opts.extensible) { return `schema element '${key}.${sKey}' is not allowed`; }
          if (typeof (eMsg = this.validateTypeString(`${key}.${sKey}`, params[sKey])) === 'string') { return eMsg; }
        }
        if (typeof _schemaKeys[sKey] === 'object') {
          if (sKey === "elements") {
            for (let xKey of Object.keys(params.elements)) {
              var eMsg;
              if (typeof (eMsg = this.validateSchemaEntry(`${key}.${xKey}`, params.elements[xKey])) === 'string') { return eMsg; }
            }
            return true;
          } else {
            let _type;
            if ((_type = __guard__(_schemaKeys[sKey], x => x.type)) == null) { return `type attribute was not defined for ${key}`; }
            if (!Array.isArray(_type)) { _type = _type.type; }
          }
        }
      }
      return true;
    } else {
      let _t = typeof params;
      if (_t !== 'function') {
        // tests for everything that's not a string, _object or function
        if (_schemaKeys[key.split('.').pop()] !== _global.wf.wfUtils.Str.capitalize(_t)) { return `value for schema element '${key}' has invalid type '<${_t}>'`; }
      } else {
        // tests for function's constructor name
        let _fn;
        if ((_fn = _global.wf.wfUtils.Fun.getConstructorName(params)) !== _schemaKeys[key]) { return `value for schema element '${key}' has invalid class or method '<${_fn}>'`; }
      }
      return true;
    }
    // should not have gotten here -- so flag it as error
    return `unable to process schema element '${key}'`;
  }
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}