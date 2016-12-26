Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
			"Array": Array,
			"ArrayBuffer": ArrayBuffer,
			"Boolean": Boolean,
			"Buffer": ArrayBuffer,
			"Date": Date,
			"Number": Number,
			"Object": Object,
			"String": String,
			"Function": Function
		});
	}
	/**
  * @param {string|function} classesOrNames
  * @returns {function}
  */


	_createClass(SchemaRoller, [{
		key: 'getClass',
		value: function getClass(classesOrNames) {
			var _k = _kinds.get(this);
			if (!Array.isArray(classesOrNames)) {
				classesOrNames = [classesOrNames];
			}
			// traverses arguemtns
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = classesOrNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var arg = _step.value;

					if (typeof arg === "string") {
						return 0 <= Object.keys(_k).indexOf(arg) ? arg.toLowerCase() : null;
					}
					// operates on object
					if ((typeof arg === 'undefined' ? 'undefined' : _typeof2(arg)) === "object") {
						//- operates on arrays
						if (Array.isArray(arg)) {
							//- holds the results set
							var _r = [];
							// traverses array elements
							var _iteratorNormalCompletion2 = true;
							var _didIteratorError2 = false;
							var _iteratorError2 = undefined;

							try {
								for (var _iterator2 = arg[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
									var n = _step2.value;

									//- tests elements
									switch (typeof n === 'undefined' ? 'undefined' : _typeof2(n)) {
										//- operates on string
										case "string":
											// sets reference onto results
											_r.push(this.getClass(n));
											break;
										//-- operates on functions/classes
										case "function":
											//- sets function/class on results
											_r.push(n);
											break;
										default:
											//- handles nested arrays
											_r.push(Array.isArray(n) ? this.getClass.apply(this, n) : null);
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

							return 0 <= _r.indexOf(null) ? { _r: null } : undefined;
						} //- ends array handling
						return null;
					} //- end typrof arg is object
					if (typeof arg === "function") {
						var _ = _global.wf.wfUtils.Fun.getConstructorName(arg);
						return this.getClass(_);
					}
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
			var _ = void 0;
			if (_ = (typeof json === 'undefined' ? 'undefined' : _typeof2(json)).match(/^(string|object)+$/)) {
				return new Schema(_[1] === "string" ? JSON.parse(json) : json);
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
				required: "Boolean",
				extensible: "Boolean",
				restrict: "String",
				validate: "Function",
				default: "*",
				elements: ["Array", "Object"],
				polymorphic: {
					type: ["Object", "Array"],
					required: false,
					elements: {
						type: {
							type: this.listClasses(),
							required: true
						},
						extensible: "Boolean",
						restrict: "String",
						validate: "Function",
						default: "*",
						elements: ["Array", "Object"]
					}
				}
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
				type: "*",
				required: false,
				extensible: false
			};
		}
	}]);

	return SchemaRoller;
}();

var _schemaroller_ = new SchemaRoller();
var _validators = new WeakMap();
/**
 * @private
 */
var __vBuilder = null;
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
		return __vBuilder;
	}
	/**
  * @returns list of validation paths
  */


	_createClass(ValidatorBuilder, [{
		key: 'list',
		value: function list() {
			var _v = _validators.get(this);
			return Object.keys(_v);
		}
		/**
   * @param path
   * @returns item at path reference
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
			_validators.get(this)[_path] = func;
			return this;
		}
		/**
   * @param {object} _ref
   * @param {string} _path
   */

	}, {
		key: 'create',
		value: function create(ref, path) {
			if (!_exists(ref)) {
				throw "create requires object reference at arguments[0]";
			}
			var _signatures = _exists(ref.polymorphic) ? ref.polymorphic : Array.isArray(ref) ? ref : [ref];
			_validators.get(this)[path] = {};
			var _functs = _signatures.map(function (_sig) {
				var _typeof = _global.wf.wfUtils.Str.capitalize(_sig.type);
				var _hasKey = 0 <= Object.keys(Validator).indexOf(_typeof);
				return new Validator[_hasKey ? _typeof : "Default"](path, _sig);
			});
			return _validators.get(this)[path] = function (value) {
				var _result;
				for (var idx in _functs) {
					_result = _functs[idx].exec(value);
					if (typeof _result === "boolean") {
						return _result;
					}
				}
				return _result;
			};
		}

		/**
   * executes validator `value` with validator at `path` 
   * @param path
   * @param value
   */

	}, {
		key: 'exec',
		value: function exec(path, value) {
			var _v = _validators.get(this);
			if (!_v.hasOwnProperty(path)) {
				return 'validator for \'' + path + '\' does not exist';
			}
			return _v[path](value);
		}
		/**
   * @returns singleton ValidatorBuilder reference
   */

	}], [{
		key: 'getInstance',
		value: function getInstance() {
			return new this();
		}
		/**
   * @returns validators WeakMap
   */

	}, {
		key: 'getValidators',
		value: function getValidators() {
			return _validators.get(ValidatorBuilder.getInstance());
		}
		/**
   * 
   */

	}, {
		key: 'create',
		value: function create(signature, path) {
			ValidatorBuilder.getInstance().create(signature, path);
		}
		/**
   * 
   */

	}, {
		key: 'getPolymorphic',
		value: function getPolymorphic(signature, path) {
			var _attr = path.split(".").pop();
			// tests for element as child element on polymorphic object signature
			if (_exists(signature.elements[_attr])) {
				ValidatorBuilder.create(signature.elements[_attr], path);
			}
		}
	}]);

	return ValidatorBuilder;
}();

;
exports.ValidatorBuilder = ValidatorBuilder;