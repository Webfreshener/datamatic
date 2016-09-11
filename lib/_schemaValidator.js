// Generated by CoffeeScript 1.10.0
var SchemaRoller, SchemaValidator, _sKeys, rx;

SchemaValidator = (function() {
  function SchemaValidator(_schema, opts1) {
    var _errorMsg, _o, _oKey, _s, i, j, len, len1, obj, ref, ref1;
    if (_schema == null) {
      _schema = {};
    }
    this.opts = opts1 != null ? opts1 : {
      extensible: false
    };
    _errorMsg = null;
    this.isValid = function() {
      return _errorMsg || true;
    };
    ref = Object.keys(_schema);
    for (i = 0, len = ref.length; i < len; i++) {
      _oKey = ref[i];
      switch (typeof _schema[_oKey]) {
        case "string":
          obj = {};
          obj[_oKey] = {
            type: _schema[_oKey].ucfirst(),
            required: false
          };
          _o = Object.assign(_schema, obj);
          _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
          break;
        case "object":
          if (!Array.isArray(_schema[_oKey])) {
            _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
          } else {
            ref1 = _schema[_oKey];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              _s = ref1[j];
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
          _errorMsg = "value for schema element '" + _oKey + "' was invalid";
      }
    }
  }

  SchemaValidator.prototype.validateTypeString = function(key, _type) {
    var e, error;
    if (key.match(/\.restrict+$/)) {
      if (typeof _type !== 'string') {
        return 'restrict requires a Regular Expression String';
      }
      try {
        "text".match(new RegExp(_type));
      } catch (error) {
        e = error;
        if (!_type.match(rx)) {
          return "Regular Expression provided for '" + key + "' was invalid";
        }
      }
    } else if (((SchemaRoller.getClass(_type.ucfirst())) != null) === false) {
      return "type '<" + _type + ">' for schema element '" + key + "' was invalid";
    }
    return true;
  };

  SchemaValidator.prototype.validateSchemaEntry = function(key, params, opts) {
    var _fn, _k, _kind, _p, _schemaKeys, _t, _type, eMsg, i, j, k, keyPath, l, len, len1, len2, len3, param, ref, ref1, ref2, ref3, sKey, xKey;
    if (opts == null) {
      opts = this.opts;
    }
    _schemaKeys = SchemaRoller.getSchemaRef();
    if (params == null) {
      return key + " was null or undefined";
    }
    if (typeof params === 'string') {
      return this.validateTypeString(key + "." + sKey, params);
    }
    if (typeof params === 'object') {
      if (!params.hasOwnProperty("type")) {
        if ((_p = (keyPath = key.split('.')).pop()) !== 'elements') {
          if (_p !== 'default') {
            return "value for schema element '" + key + "' was malformed. Property 'type' was missing";
          }
        } else {
          ref = Object.keys(params);
          for (i = 0, len = ref.length; i < len; i++) {
            param = ref[i];
            this.validateSchemaEntry((keyPath.join('.')) + "." + param, params[param]);
            return;
          }
        }
      }
      if ((SchemaRoller.getClass(params.type)) == null) {
        if (Object.keys(params).length === 0) {
          return true;
        }
        if (typeof params.type === 'object') {
          return this.validateSchemaEntry(key, params.type);
        }
        return "value for schema element '" + key + "' has invalid type '<" + params.type + ">'";
      }
      ref1 = Object.keys(params);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        sKey = ref1[j];
        if (!((_schemaKeys[sKey] != null) || opts.extensible)) {
          return "schema element '" + key + "." + sKey + "' is not allowed";
        }
        if (typeof params[sKey] === "string") {
          _kind = params[sKey].ucfirst();
          if (!((_schemaKeys[sKey] != null) || opts.extensible)) {
            return "schema element '" + key + "." + sKey + "' is not allowed";
          }
          if (typeof (eMsg = this.validateTypeString(key + "." + sKey, params[sKey])) === 'string') {
            return eMsg;
          }
        }
        if (typeof _schemaKeys[sKey] === 'object') {
          _type = _schemaKeys[sKey].type;
          if (!Array.isArray(_type)) {
            if (_type !== _kind) {
              return "invalid schema element '" + key + "' requires type '" + _type + "' type was '<" + _kind + ">'";
            }
          }
        } else {
          if (Array.isArray(params[sKey])) {
            ref2 = params[sKey];
            for (k = 0, len2 = ref2.length; k < len2; k++) {
              _k = ref2[k];
              if (typeof (eMsg = this.validateSchemaEntry(key + "." + sKey, _k)) === 'string') {
                return eMsg;
              }
            }
          } else {
            if (sKey !== 'elements') {
              if (typeof (eMsg = this.validateSchemaEntry(key + "." + sKey, params[sKey])) === 'string') {
                return eMsg;
              }
            } else {
              ref3 = params[sKey];
              for (l = 0, len3 = ref3.length; l < len3; l++) {
                xKey = ref3[l];
                if (typeof (eMsg = this.validateSchemaEntry(key + "." + xKey, params[sKey][xKey])) === 'string') {
                  return eMsg;
                }
              }
            }
            if (typeof (eMsg = this.validateSchemaEntry(key + "." + sKey, params[sKey])) === 'string') {
              return eMsg;
            }
            return true;
          }
        }
      }
      return true;
    } else {
      _t = typeof params;
      if (_t !== 'function') {
        if (_schemaKeys[key.split('.').pop()] !== _t.ucfirst()) {
          return "value for schema element '" + key + "' has invalid type '<" + _t + ">'";
        }
      } else {
        if ((_fn = Fun.getConstructorName(params)) !== _schemaKeys[key]) {
          return "value for schema element '" + key + "' has invalid class or method '<" + _fn + ">'";
        }
      }
      return true;
    }
    return "unable to process schema element '" + key + "'";
  };

  return SchemaValidator;

})();

module.exports = SchemaValidator;

SchemaRoller = require('./schemaroller').SchemaRoller;

_sKeys = Object.keys(SchemaRoller.getSchemaRef());

rx = new RegExp("^((" + (_sKeys.join('|')) + ")+,?){" + _sKeys.length + "}$");