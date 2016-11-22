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
var _kinds = new WeakMap() || {};
// holds references to registered JS Objects
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
			for (var _len = arguments.length, classesOrNames = Array(_len), _key = 0; _key < _len; _key++) {
				classesOrNames[_key] = arguments[_key];
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

var _schemaroller_ = new SchemaRoller();
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
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = _v[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var vItm = _step3.value;

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

;
exports.ValidatorBuilder = ValidatorBuilder;