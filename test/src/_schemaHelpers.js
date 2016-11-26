Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _global = typeof exports !== 'undefined' && exports !== null ? exports : window;
_global.wf = require('wf-utils');
var WeakMap = require('es6-weak-map');
var _exists = _global.wf.wfUtils.exists;
// holds references to registered JS Objects
var _object = new WeakMap();
var _mdRef = new WeakMap();
var _kinds = new WeakMap() || {};
var _schemaKeys = new WeakMap();
var _schemaOptions = new WeakMap();
var _required_elements = new WeakMap();
/**
 * @private
 */

var _metaData = function () {
  /**
   * @constructor
   * @param {Schema|Vector} _oRef - Object Reference to item being described
   * @param {object} _data -- Initial Data {parent:Schema|Vector}
   */
  function _metaData(_oRef) {
    var _data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, _metaData);

    var _cName = _global.wf.wfUtils.Fun.getConstructorName(_oRef);
    if (!(_oRef instanceof Schema || _oRef instanceof Vector)) {
      throw 'new _metaData() argument 1 requires subclass Schema or Vector. Was subclass of \'<' + _cName + '>\'';
    }
    if (this._createID == null) {
      (function () {
        var _id = 0;
        _metaData.prototype._createID = function () {
          if (this.__objID == null) {
            this.__objID = '' + _cName + (_id + 1);
          }
          return this.__objID;
        };
      })();
    }
    Object.assign(_data, {
      _id: this._createID(),
      _className: _cName,
      _created: Date.now()
    });
    _mdRef.set(this, _data);
  }
  /**
   * @param {string} key
   */


  _createClass(_metaData, [{
    key: 'get',
    value: function get(key) {
      var _ = _mdRef.get(this);
      return _.hasOwnProperty(key) ? _[key] : null;
    }
    /**
     * not implemented
     */

  }, {
    key: 'set',
    value: function set() {
      return this;
    }
    /**
     * @returns {string} Unique ObjectID
     */

  }, {
    key: 'objectID',
    get: function get() {
      return this.get('_id');
    }
    /**
     * @returns {Schema|Vector} root Schema Element
     */

  }, {
    key: 'root',
    get: function get() {
      return this.get('_root');
    }
    /**
     * @returns {string} path to Element
     */

  }, {
    key: 'path',
    get: function get() {
      return this.get('_path');
    }
    /**
     * @returns {string} path to Element
     */

  }, {
    key: 'parent',
    get: function get() {
      var _ = this.path || "";
      var _p = _.split('.');
      _p = _p.length > 1 ? _p.slice(0, _p.length - 2).join('.') : _p[0];
      return _p.length > 0 ? this.root.get(_p) : this.root;
    }
  }]);

  return _metaData;
}();
/**
 * Strict JS Objects and Collections created from JSON Schema Defintions
 * @class SchemaRoller
 * @example let {Schema,Vector} = window.SchemaRoller();
 */


var SchemaRoller = function () {
  function SchemaRoller() {
    _classCallCheck(this, SchemaRoller);

    _kinds.set(this, {
      Array: Array,
      ArrayBuffer: ArrayBuffer,
      Boolean: Boolean,
      Buffer: ArrayBuffer,
      Date: Date,
      Number: Number,
      Object: Object,
      String: String,
      Function: Function
    });
  }
  /**
   * @param {string|function} classesOrNames
   * @returns {function}
   */


  _createClass(SchemaRoller, [{
    key: 'getClass',
    value: function getClass() {
      for (var _len = arguments.length, classesOrNames = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
        classesOrNames[_key2] = arguments[_key2];
      }

      // traverses arguemtns
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = classesOrNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var arg = _step.value;

          // operates on object
          if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object') {
            //- operates on arrays
            if (Array.isArray(arg)) {
              //- holds the results set
              var _r2 = [];
              // traverses array elements
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = arg[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var n = _step2.value;

                  //- tests elements
                  switch (typeof n === 'undefined' ? 'undefined' : _typeof(n)) {
                    //- operates on string
                    case 'string':
                      // sets reference onto results
                      _r2.push(this.getClass(n));
                      break;
                    //-- operates on functions/classes
                    case 'function':
                      //- sets function/class on results
                      _r2.push(n);
                      break;
                    default:
                      //- handles nested arrays
                      _r2.push(Array.isArray(n) ? this.getClass.apply(this, n) : null);
                  }
                } //- end for/switch
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              return 0 <= _r2.indexOf(null) ? { _r: null } : undefined;
            } //- ends array handling
            return null;
          } //- end typrof arg is object
          var _k = _kinds.get(this);
          return _exists(_k[arg]) ? _k[arg] : null;
        } //- end args in classesOrNames
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    }
    /**
     * @param {string} name
     * @param {function} clazz
     */

  }, {
    key: 'registerClass',
    value: function registerClass(name, clazz) {
      return _kinds.get(this)[name] = clazz;
    }
    /**
     * @param {string} name
     */

  }, {
    key: 'unregisterClass',
    value: function unregisterClass(name) {
      if (_kinds.hasOwnProperty(name)) {
        return delete _kinds.get(this)[name];
      }
      return false;
    }
    /**
     * @return list of registered Class Names
     */

  }, {
    key: 'listClasses',
    value: function listClasses() {
      return Object.keys(_kinds.get(this));
    }
    /**
     * creates new Schema from JSON data
     * @param {string|object} json
     * @returns Schema
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      if (_r = (typeof json === 'undefined' ? 'undefined' : _typeof(json)).match(/^(string|object)+$/)) {
        return new Schema(_r[1] === 'string' ? JSON.parse(json) : json);
      }
      throw new Error("json must be either JSON formatted string or object");
    }
    /**
     * @returns {object} base schema element signature
     */

  }, {
    key: 'schemaRef',
    get: function get() {
      return {
        type: {
          type: this.listClasses(),
          required: true
        },
        required: 'Boolean',
        extensible: 'Boolean',
        restrict: 'String',
        validate: 'Function',
        default: '*',
        elements: ['Array', 'Object']
      };
    }
    /**
     * @getter
     * @returns {object} base schema element settings
     * @example let _schemaRoller = new SchemaRoller();
     * var _schemaEl = { myElement: _schemaRoller.defaults }
     * console.log( JSON.stringify( _schemaEl ) );
     * // -> `{ "myElement": { "type": "*", "required": false, "extensible": false } }`
     * 	  
     */

  }, {
    key: 'defaults',
    get: function get() {
      return {
        type: '*',
        required: false,
        extensible: false
      };
    }
  }]);

  return SchemaRoller;
}();
/**
 * @class Schema
 */


var Schema = function () {
  /**
   * @constructor
   * @param {Object} _o - schema definition object
   * @param {Object} opts - schema options
   */
  function Schema() {
    var _o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { extensible: false };

    _classCallCheck(this, Schema);

    var eMsg;
    var _arr = [_object, _mdRef, _validators];
    for (var _i = 0; _i < _arr.length; _i++) {
      var _k = _arr[_i];
      _k.set(this, {});
    }
    _required_elements.set(this, []);
    // traverses elements of schema
    if (_exists(_o.elements)) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(_o.elements)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _oE = _step3.value;

          if (_exists(_o.elements[_oE].required)) {
            _required_elements.get(this).push(_oE);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    if (!(this instanceof _metaData)) {
      if (arguments.length <= 2 || _exists(arguments[2]) && arguments[2] instanceof _metaData) {
        _mdRef.set(this, new _metaData(this, { _path: "", _root: this }));
      } else {
        _mdRef.set(this, arguments[2]);
      }
    }

    // attempts to validate provided `schema` entries
    var _schema_validator = new SchemaValidator(_o, opts);
    // throws error if error messagereturned
    if (typeof (eMsg = _schema_validator.isValid()) === 'string') {
      throw eMsg;
    }
    // builds validations from SCHEMA ENTRIES
    var _walkSchema = function _walkSchema(obj, path) {
      var _map = function _map(itm, objPath) {
        return _walkSchema(item, objPath);
      };
      return function () {
        var result = [];
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = (Array.isArray(obj) ? obj : Object.keys(obj))[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _k = _step4.value;

            var item1 = void 0;
            var objPath = _exists(path) && 1 <= path.length ? path + '.' + _k : _k;
            ValidatorBuilder.getInstance().create(obj[_k], objPath);
            if (obj[_k].hasOwnProperty('elements') && _typeof(obj[_k].elements) === 'object') {
              if (!Array.isArray(obj[_k].elements)) {
                item1 = _walkSchema(obj[_k].elements, objPath);
              } else {
                item1 = obj[_k].elements.map(_map(item, objPath));
              }
            }
            result.push(item1);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return result;
      }();
    };
    _walkSchema(_o.elements || {});
    /**
     * @private
     */
    var _validate = function _validate(key, value) {
      var _list = ValidatorBuilder.getInstance().list();
      var _ref;
      // key = if value instanceof _metaData then value.get( '_path' ) else value.getpath
      // return "object provided was not a valid subclass of Schema" unless value instanceof Schema
      // return "object provided was malformed" unless typeof (key = value.getPath?()) is 'string'
      var msg = void 0;
      if (0 <= _list.indexOf(key)) {
        var _path = [];
        var iterable = key.split('.');
        var _p;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = iterable[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _k = _step5.value;

            _path[i] = _k;
            _p = _path.join('.');
            if (0 > _l.indexOf(_p)) {
              _path[i] = '*';
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (!(_ref = ValidatorBuilder.getInstance().get(_p))) {
          if (!opts.extensible) {
            return '\'' + key + '\' is not a valid schema property';
          }
        }
        ValidatorBuilder.getInstance().set(key, _ref);
      }
      if (typeof (msg = ValidatorBuilder.getInstance().exec(key, value)) === 'string') {
        return msg;
      }
      return true;
    };
    /**
     * @private
     */
    var _getKinds = function _getKinds(_s) {
      var _elems = Object.keys(_s).map(function (key) {
        return _exists(_s[key].type) ? _s[key].type : null;
      });
      _elems = _elems.filter(function (elem) {
        return elem !== null;
      });
      return _elems.length ? _elems : null;
    };
  } // - end @constructor
  /**
   * @param {string} key
   * @returns {any}
   */


  _createClass(Schema, [{
    key: 'get',
    value: function get(key) {
      var __o = _object.get(this);
      return __o[key] || null;
    }
    /**
     * sets value to schema key
     * @param {string|object} key
     * @param {any} value
     */

  }, {
    key: 'set',
    value: function set(key, value) {
      var k;
      // -- handles objects passed in as key
      if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        var _f = _hasRequiredFields(Object.assign({}, _object, key));
        if (typeof _f === 'string') {
          return _f;
        }
        // calls set with nested key value pair
        for (k in key) {
          var _eMsg = this.set(key[k], v);
          if (typeof _eMsg === 'string') {
            return _eMsg;
          }
        }
      }
      // handles strings passed as key
      else {
          var _parent = this.parent;
          var _parentPath = _parent.path;
          var _schema2 = exists(_o.elements) ? _o.elements : _o;
          var _extensible2 = exists(_o.extensible) ? _o.extensible : opts.extensible || false;
          var _elSchema;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = key.split('.')[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              k = _step6.value;

              if (_exists(_elSchema[k]) && _elSchema[k].hasOwnProperty('extensible')) {
                _extensible2 = _elSchema[k].extensible;
              }
              _elSchema = _exists(_elSchema.elements) ? _elSchema.elements[k] : _elSchema[k];
              var _key3 = _exists(_parentPath) && _parentPath.length ? _parentPath + '.' + k : k;
              if (!_exists(_elSchema)) {
                if (!_extensible2) {
                  return 'element \'' + k + '\' is not a valid element';
                }
                _elSchema = {
                  type: '*',
                  required: true,
                  extensible: false
                };
              }
              if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                var _s = _objHelper(value);
                if (typeof _s === 'string') {
                  return s + ' at \'' + key + '\'';
                }
                if (!_exists(_elSchema) || !_exists(_s) || (typeof _s === 'undefined' ? 'undefined' : _typeof(_s)) !== 'object') {
                  return '\'' + key + '\' was invalid';
                }
                value = _s[_s instanceof Vector ? 'replaceAll' : 'set'](value);
                if (typeof value === 'string') {
                  return value;
                }
              } else {
                if (key !== "_root") {
                  // and @ instanceof _metaData
                  if (typeof (eMsg = _validate(_key3, value)) === 'string') {
                    return eMsg;
                  }
                }
              }
              var __o = {};
              __o[key] = value;
              _object.set(this, __o);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      // returns self for chaining
      return this;
    }
    /**
     * @returns {true|string} returns error string or true
     */

  }, {
    key: 'validate',
    value: function validate() {
      var _path = this.path;
      // return true
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = ValidatorBuilder.getInstance().list()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _k = _step7.value;

          var e = void 0;
          _path = _path.length > 0 ? _path + '.' + _k : _k;
          if (typeof (e = _validate(_k, this.root.get(_k))) === 'string') {
            return e;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return true;
    }
  }, {
    key: 'objectID',

    /**
     * @returns {string} Object ID for Schema
     */
    get: function get() {
      return _mdRef.get(this)._id;
    }
    /**
     * @returns {Schema} elemetn at Schema root
     */

  }, {
    key: 'root',
    get: function get() {
      return _mdRef.get(this).root || this;
    }
    /**
     * @returns {string} path to current Schema
     */

  }, {
    key: 'path',
    get: function get() {
      return _mdRef.path;
    }
    /**
     * @returns {Schema} parent Schema element
     */

  }, {
    key: 'parent',
    get: function get() {
      return _mdRef.parent || this;
    }
    /**
     * @returns list of required elements on this Schema
     */

  }, {
    key: 'requiredFields',
    get: function get() {
      return _required_elements.get(this);
    }
    /**
     * indicates if Schema will accept arbitrary keys
     * @returns {boolean}
     */

  }, {
    key: 'isExtensible',
    get: function get() {
      return _schemaOptions.get(this).extensible;
    }
  }]);

  return Schema;
}();
/**
 * @private
 */


var __vBuilder = null;
var _validators = new WeakMap();
/**
 * @private
 */

var ValidatorBuilder = function () {
  /**
   * @constructor
   */
  function ValidatorBuilder() {
    _classCallCheck(this, ValidatorBuilder);

    if (!_exists(__vBuilder)) {
      _validators.set(__vBuilder = this, {});
    }
    // holds validation methods
    return __vBuilder;
  } // - end constructor
  /**
   * @return list of validator paths
   */


  _createClass(ValidatorBuilder, [{
    key: 'list',
    value: function list() {
      var _v = _validators.get(this);
      return Object.keys(_v);
    }
    /**
     * @param path
     * @return item at path reference
     */

  }, {
    key: 'get',
    value: function get(path) {
      var _v = _validators.get(this);
      return _exists(_v[path]) ? _v[path] : null;
    }
    /**
     * @param _path
     * @param func
     */

  }, {
    key: 'set',
    value: function set(_path, func) {
      if (!_exists(func) || typeof func !== 'function') {
        return "2nd argument expects a function";
      }
      var _v = _validators.get(this);
      _v[_path] = func;
      return this;
    }
    /**
     * @param {object} _ref
     * @param {string} _path
     */

  }, {
    key: 'create',
    value: function create(_ref, _path) {
      var _this = this;

      var _v = [_ref];
      if (!_exists(__vBuilder)) {
        throw "ValidatorBuilder not properly initialized";
      }
      var __validators = _validators.get(this);
      if (Array.isArray(_ref)) {
        _v = _ref.map(function (_s) {
          return _this.create(_s, _path);
        });
      }
      return __validators[_path] = function (value) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = _v[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var vItm = _step8.value;

            var fName = void 0;
            if (vItm.required && value == null) {
              return 'value for \'' + _path + '\' is required';
            }
            switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
              case 'string':
                if ((typeof vItm === 'undefined' ? 'undefined' : _typeof(vItm)) === 'object') {
                  var _x = vItm.type != null ? vItm.type : null;
                }
                if (typeof _x === 'undefined' || !_exists(_x)) {
                  var _x = vItm;
                }
                if (vItm !== 'String' && !_x.match(/^string$/i)) {
                  return _path + ' requires ' + _x + ' type was \'<String>\'';
                }
                if (_exists(vItm.restrict)) {
                  if (!_exists(new RegExp(vItm.restrict).exec(value))) {
                    return 'value \'' + value + '\' for ' + _path + ' did not match required expression';
                  }
                }
                return true;
                break;
              case 'function':
                var _x = typeof vItm === 'string' ? vItm : _global.wf.wfUtils.Fun.getConstructorName(vItm);
                return _x === _global.wf.wfUtils.Fun.getConstructorName(value);
                break;
              case 'object':
                if (!Array.isArray(vItm)) {
                  return __validators[_path](val);
                } else {
                  for (var val = 0; val < value.length; val++) {
                    var e = void 0;
                    k = value[val];
                    if (typeof (e = __validators[_path](val)) === 'string') {
                      return e;
                    }
                  }
                  return true;
                }
                break;
              case 'number':
                _x = vItm.type != null && typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
                if (!_exists(_x)) {
                  _x = vItm;
                }
                if (_x === 'Number') {
                  return true;
                }
                if ((fName = _global.wf.wfUtils.Fun.getFunctionName(_x)) !== 'Number') {
                  return '\'' + _path + '\' expected ' + fName + ', type was \'<Number>\'';
                }
                return !isNaN(new _x(value));
                break;
              default:
                _x = typeof vItm.type === 'string' ? _schemaroller_.getClass(vItm.type) : vItm.type;
                return _exists(_x) && value instanceof _x;}
          }
          // should have returned in the switch statement
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        return 'unable to validate ' + _path;
      };
    }
    /**
     * executes validator `value` with validator at `path` 
     * @param _path
     * @param value
     */

  }, {
    key: 'exec',
    value: function exec(_path, value) {
      var _v = _validators.get(this);
      if (!_v.hasOwnProperty(_path)) {
        return 'validator for \'' + _path + '\' does not exist';
      }
      return _v[_path](value);
    }
  }], [{
    key: 'getInstance',
    value: function getInstance() {
      return new this();
    }
  }]);

  return ValidatorBuilder;
}();
/**
 * @private
 * @class
 */


var SchemaValidator = function () {
  /**
   * @constructor
   * @param {object} schema
   * @param {object} options
   */
  function SchemaValidator() {
    var _schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { extensible: false };

    _classCallCheck(this, SchemaValidator);

    _schemaOptions.set(this, opts);
    var _errorMsg = null;
    this.isValid = function () {
      return _errorMsg || true;
    };
    // validates SCHEMA ENTRIES
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = Object.keys(_schema)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        var _oKey = _step9.value;

        switch (_typeof(_schema[_oKey])) {
          case "string":
            var obj = {};
            obj[_oKey] = {
              type: _global.wf.wfUtils.Str.capitalize(_schema[_oKey]),
              required: false
            };
            var _o2 = Object.assign(_schema, obj);
            _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
            break;
          case "object":
            if (!Array.isArray(_schema[_oKey])) {
              if (_oKey !== "elements") {
                _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
              } else {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                  for (var _iterator10 = Object.keys(_schema[_oKey])[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var xKey = _step10.value;

                    if (typeof (_errorMsg = this.validateSchemaEntry(xKey, _schema[_oKey][xKey])) === "string") {
                      return _errorMsg;
                    }
                  }
                } catch (err) {
                  _didIteratorError10 = true;
                  _iteratorError10 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                      _iterator10.return();
                    }
                  } finally {
                    if (_didIteratorError10) {
                      throw _iteratorError10;
                    }
                  }
                }
              }
            } else {
              var _iteratorNormalCompletion11 = true;
              var _didIteratorError11 = false;
              var _iteratorError11 = undefined;

              try {
                for (var _iterator11 = _schema[_oKey][Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                  var _s = _step11.value;

                  if (typeof _schema[_oKey][_s] === "string") {
                    _errorMsg = this.validateTypeString(_oKey, _schema[_oKey][_s]);
                  } else {
                    _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey][_s]);
                  }
                }
              } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                  }
                } finally {
                  if (_didIteratorError11) {
                    throw _iteratorError11;
                  }
                }
              }
            }
            break;
          case "boolean":
            _errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
            break;
          default:
            _errorMsg = 'value for schema element \'' + _oKey + '\' was invalid';
        }
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }
  }
  /**
   * @param {string} key
   * @param {string} _type
   */


  _createClass(SchemaValidator, [{
    key: 'validateTypeString',
    value: function validateTypeString(key, _type) {
      //- ignores special `default` object key
      if (key.match(/\.?default+$/)) {
        return true;
      }
      //- hanbdles restrictions defined in `restrict` object key
      if (key.match(/\.?restrict+$/)) {
        if (typeof _type !== "string" || !_type.length) {
          return "restrict requires a Regular Expression String";
        }
        try {
          //- tests for valid RegExp string
          "text".match(new RegExp(_type));
        } catch (e) {
          return 'Regular Expression provided for \'' + key + '\' was invalid. ' + e;
        }
      }
      //- tests for basic string type declaration {key: {type: "String"} }
      else {
          if (!_exists(_schemaroller_.getClass(_global.wf.wfUtils.Str.capitalize(_type)))) {
            return 'type \'<' + _type + '>\' for schema element \'' + key + '\' was invalid';
          }
        }
      return true;
    }
    /**
     * @param {string} key
     * @param {object{ params
     */

  }, {
    key: 'validateUntypedMembers',
    value: function validateUntypedMembers(key, params) {
      if (Array.isArray(params)) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = params[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var _item = _step12.value;

            var _res;
            if (typeof (_res = this.validateSchemaEntry(key, _item)) === "string") {
              return _res;
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      } else {
        var _p = void 0;
        var keyPath = void 0;
        if ((_p = (keyPath = key.split(".")).pop()) !== "elements") {
          if (_p === "default") {
            return true;
          }
          return 'value for schema element \'' + key + '\' was malformed. Property \'type\' was missing';
        } else {
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = Object.keys(params)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var param = _step13.value;

              var _res;
              var _keys = [].concat(keyPath).concat(param);
              if (typeof (_res = this.validateSchemaEntry('' + _keys.join("."), params[param])) === "string") {
                return _res;
              }
            }
          } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
              }
            } finally {
              if (_didIteratorError13) {
                throw _iteratorError13;
              }
            }
          }
        }
      }
      return true;
    }
    /**
     * @param {string} key
     * @param {object{ params
     */

  }, {
    key: 'validateSchemaClass',
    value: function validateSchemaClass(key, params) {
      if (!_exists(key)) {
        throw "key was undefined";
      }
      if (typeof key !== "string") {
        throw 'string expected for argument \'key\'. Type was \'<' + (typeof key === 'undefined' ? 'undefined' : _typeof(key)) + '>\'';
      }
      if (!_exists(params)) {
        throw "params was undefined";
      }
      if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== "object") {
        throw 'object expected for argument \'params\'. Type was \'<' + (typeof params === 'undefined' ? 'undefined' : _typeof(params)) + '>\'';
      }
      if (params.type === "*") {
        return true;
      }
      if (Object.keys(params).length === 0) {
        return true;
      }
      if (_typeof(params.type) === "object") {
        return this.validateSchemaEntry(key, params.type);
      }
      if (key.split(".").pop() === "default") {
        if (this._defaults == null) {
          this._defaults = {};
        }
        this._defaults[key] = params;
        return true;
      }
      return 'value for schema element \'' + key + '\' has invalid type \'<' + params.type + '>\'';
    }
    /**
     * @param {string} key
     * @param {string} sKey
     * @param {object} params
     */

  }, {
    key: 'validateSchemaParamString',
    value: function validateSchemaParamString(key, sKey, params) {
      var eMsg;
      var _kind = _global.wf.wfUtils.Str.capitalize(params[sKey]);
      var _schemaKeys = _schemaroller_.schemaRef;
      var opts = _schemaOptions.get(this);
      // handles special `restrict` key
      if (sKey === "restrict") {
        try {
          new RegExp(params[sKey]);
        } catch (e) {
          return e;
        }
        return true;
      }
      // rejects values for keys not found in Schema
      if (!_exists(_schemaKeys[sKey]) && opts.extensible === false) {
        return 'schema element \'' + key + '.' + sKey + '\' is not allowed';
      }
      if (typeof (eMsg = this.validateTypeString(key + '.' + sKey, params[sKey])) === "string") {
        return eMsg;
      }
      return true;
    }
    /**
     * @param {string} key
     * @param {object} params
     * @param {object} opts
     */

  }, {
    key: 'validateSchemaEntry',
    value: function validateSchemaEntry(key, params, opts) {
      var _schemaKeys = _schemaroller_.schemaRef;
      if (!_exists(opts)) {
        opts = _schemaOptions.get(this);
      }
      if (params == null) {
        return key + ' was null or undefined';
      }
      if (typeof params === "boolean") {
        return true;
      }
      if (typeof params === "string") {
        return this.validateTypeString('' + key, params);
      }
      if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === "object") {
        if (!params.hasOwnProperty("type")) {
          return this.validateUntypedMembers(key, params);
        }
        // handles Classes/Functions
        if (_schemaroller_.getClass(params.type) == null) {
          return this.validateSchemaClass(key, params);
        }
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = Object.keys(params)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var sKey = _step14.value;

            var _type;
            // rejects unknown element if schema non-extensible
            if (_schemaKeys[sKey] == null && !opts.extensible) {
              return 'schema element \'' + key + '.' + sKey + '\' is not allowed';
            }
            // returns result of Params String Valdiation
            if (typeof params[sKey] === "string") {
              return this.validateSchemaParamString(key, sKey, params);
            }
            // returns result of
            if (_typeof(_schemaKeys[sKey]) === "object") {
              // handles `elements` object
              if (sKey === "elements") {
                var _iteratorNormalCompletion15 = true;
                var _didIteratorError15 = false;
                var _iteratorError15 = undefined;

                try {
                  for (var _iterator15 = Object.keys(params.elements)[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var xKey = _step15.value;

                    var _eMsg2 = this.validateSchemaEntry(key + '.' + xKey, params.elements[xKey]);
                    if (typeof _eMsg2 === "string") {
                      return _eMsg2;
                    }
                  }
                } catch (err) {
                  _didIteratorError15 = true;
                  _iteratorError15 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                      _iterator15.return();
                    }
                  } finally {
                    if (_didIteratorError15) {
                      throw _iteratorError15;
                    }
                  }
                }

                return true;
              }
              // attempts to handle Native Types
              else {
                  _type = _schemaKeys[sKey].type;
                  if (!_exists(_type)) {
                    return 'type attribute was not defined for ' + key;
                  }
                  if (!Array.isArray(_type)) {
                    _type = _type.type;
                  }
                }
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }

        return true;
      }
      // handles non-object entries (Function, String, Number, Boolean, ...)
      else {
          var _t = typeof params === 'undefined' ? 'undefined' : _typeof(params);
          if (_t !== "function") {
            var _ = _schemaKeys[key.split(".").pop()];
            // tests for everything that"s not a string, _object or function
            if (_ !== _global.wf.wfUtils.Str.capitalize(_t)) {
              return 'value for schema element \'' + key + '\' has invalid type \'<' + _t + '>\'';
            }
          } else {
            var _2 = _global.wf.wfUtils.Fun.getConstructorName(params);
            // tests for function"s constructor name
            if (_2 !== _schemaKeys[key]) {
              return 'value for schema element \'' + key + '\' has invalid class or method \'<' + _2 + '>\'';
            }
          }
          return true;
        }
      // should not have gotten here -- so flag it as error
      return 'unable to process schema element \'' + key + '\'';
    }
  }]);

  return SchemaValidator;
}();

var _schemaroller_ = new SchemaRoller();
/**
 * @private
 */

var SchemaHelpers = function () {
  /**
   * @constructor
   */
  function SchemaHelpers(_ref) {
    _classCallCheck(this, SchemaHelpers);

    if (!_exists(_ref) || !(_ref instanceof Schema)) {
      throw "arguments[0] must be type 'Schema'";
    }
    this._ref = _ref;
  }
  /**
   * @param {Object} itm
   * @returns {String|false}
   */


  _createClass(SchemaHelpers, [{
    key: 'ensureKindIsString',
    value: function ensureKindIsString(itm) {
      switch (typeof itm === 'undefined' ? 'undefined' : _typeof(itm)) {
        case 'string':
          return itm;
        case 'object':
          if (itm.hasOwnProperty('type')) {
            return this.ensureKindIsString(itm.type);
          }
          break;
      }
      return false;
    }
  }, {
    key: 'hasRequiredFields',

    /**
     * tests if required fields exist on object
     * @param {Object} obj
     * @returns {true|string} - returns true or error string
     */
    // helper method to test if field requirements are met
    value: function hasRequiredFields(obj) {
      var oKeys = Object.keys(obj);
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = this._ref.requiredFields[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var key = _step16.value;

          // _path = (_path = this.path()).length ? _path : 'root element';
          if (0 > oKeys.indexOf(key)) {
            return 'required property \'' + key + '\' is missing';
          }
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      return true;
    }
  }, {
    key: 'createSchemaChild',

    /**
     * @param {Object} value
     * @param {_metaData} metaData
     */
    value: function createSchemaChild(value, metaData) {
      var _kinds;
      // tests if value is not Array
      if (!Array.isArray(value)) {
        var _opts = { extensible: _extensible };
        var _md = new _metaData(this, {
          _path: _key,
          _root: this.root()
        });
        var _schemaDef = _exists(_schema.elements) ? _schema.elements : _schema;
        return new Schema(_schemaDef, _opts, metaData);
      } else {
        _kinds = _getKinds(_schema);
        if (Array.isArray(_kinds)) {
          _kinds = _kinds.map(this.ensureKindIsString(value));
          _kinds = _kinds.filter(function (itm) {
            return itm !== null;
          });
          _kinds = _kinds.length ? _kinds : '*';
          return new Vector(_kinds || '*', metaData);
        }
      }
      return "unable to process value";
    }
  }]);

  return SchemaHelpers;
}();

;
exports.Schema = Schema;
exports.SchemaHelpers = SchemaHelpers;