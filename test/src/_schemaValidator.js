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
var _kinds = new WeakMap() || {};
var _schemaKeys = new WeakMap();
var _schemaOptions = new WeakMap();
/**
 * Strict JS Objects and Collections created from JSON Schema Definitions
 * @class JSD
 * @example let {Schema,Vector} = window.JSD();
 */

var JSD = function () {
	function JSD() {
		_classCallCheck(this, JSD);

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


	_createClass(JSD, [{
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
					if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === "object") {
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
									switch (typeof n === 'undefined' ? 'undefined' : _typeof(n)) {
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
			if (_ = (typeof json === 'undefined' ? 'undefined' : _typeof(json)).match(/^(string|object)+$/)) {
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
				default: "*",
				elements: ["Object", "Array"],
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
						elements: ["Object", "Array"]
					}
				}
			};
		}
		/**
   * @getter
   * @returns {object} base schema element settings
   * @example let _schemaRoller = new JSD();
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

	return JSD;
}();

var _jsd_ = new JSD();
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
		var _iterate = Array.isArray(_schema) ? _schema : Object.keys(_schema);
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = _iterate[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _oKey = _step3.value;

				switch (_typeof(_schema[_oKey])) {
					case "string":
						var obj = {};
						obj[_oKey] = {
							type: _global.wf.wfUtils.Str.capitalize(_schema[_oKey]),
							required: false
						};
						var _o = Object.assign(_schema, obj);
						_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
						break;
					case "object":
						if (!Array.isArray(_schema[_oKey])) {
							if (_oKey !== "elements") {
								_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
							} else {
								var _iteratorNormalCompletion4 = true;
								var _didIteratorError4 = false;
								var _iteratorError4 = undefined;

								try {
									for (var _iterator4 = Object.keys(_schema[_oKey])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
										var _x = _step4.value;

										if (typeof (_errorMsg = this.validateSchemaEntry(_x, _schema[_oKey][_x])) === "string") {
											return _errorMsg;
										}
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
							}
						} else {
							var _iteratorNormalCompletion5 = true;
							var _didIteratorError5 = false;
							var _iteratorError5 = undefined;

							try {
								for (var _iterator5 = _schema[_oKey][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
									var _s = _step5.value;

									if (typeof _schema[_oKey][_s] === "string") {
										_errorMsg = this.validateTypeString(_oKey, _schema[_oKey][_s]);
									} else {
										_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey][_s]);
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
						}
						break;
					case "boolean":
						_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
						break;
					default:
						_errorMsg = 'value for schema element \'' + _oKey + '\' was invalid';}
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
	/**
  *  @param {string} key
  *  @param {string} _type
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
					if (!_exists(_jsd_.getClass(_global.wf.wfUtils.Str.capitalize(_type)))) {
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
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = params[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var item = _step6.value;

						var _res;
						if (typeof (_res = this.validateSchemaEntry(key, item)) === "string") {
							return _res;
						}
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
			} else {
				var _p = void 0;
				var keyPath = void 0;
				if ((_p = (keyPath = key.split(".")).pop()) !== "elements") {
					if (_p === "default") {
						return true;
					}
					if (params.hasOwnProperty("polymorphic")) {
						return this.validateSchemaEntry(key, params.polymorphic);
					}
					return 'value for schema element \'' + key + '\' was malformed. Property \'type\' was missing';
				} else {
					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = Object.keys(params)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var param = _step7.value;

							var _res;
							var _keys = [].concat(keyPath).concat(param);
							if (typeof (_res = this.validateSchemaEntry('' + _keys.join("."), params[param])) === "string") {
								return _res;
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
			var _kind = _global.wf.wfUtils.Str.capitalize(params[sKey]);
			var _schemaKeys = _jsd_.schemaRef;
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
			var eMsg = this.validateTypeString(key + '.' + sKey, params[sKey]);
			if (typeof eMsg === "string") {
				return eMsg;
			}
			return true;
		}
		/**
   * @param {string} 
   */

	}, {
		key: 'validateSchemaParam',
		value: function validateSchemaParam(key, sKey, _schemaKeys, params) {
			var _type;
			// rejects unknown element if schema non-extensible
			if (!_exists(_schemaKeys[sKey]) && !_schemaOptions.get(this).extensible) {
				return 'schema element \'' + key + '.' + sKey + '\' is not allowed';
			}
			// returns result of Params String Valdiation
			if (typeof params[sKey] === "string") {
				var _ = this.validateSchemaParamString(key, sKey, params);
				if (typeof _ === "string") {
					return _;
				}
			}
			// returns result of
			if (_typeof(_schemaKeys[sKey]) === "object") {
				// handles `elements` object
				if (sKey === "elements") {
					var _iterate2 = Array.isArray(params.elements) ? params.elements : Object.keys(params.elements);
					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = _iterate2[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var xKey = _step8.value;

							var eMsg = this.validateSchemaEntry(key + '.' + xKey, params.elements[xKey]);
							if (typeof eMsg === "string") {
								return eMsg;
							}
						}
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
			return;
		}
		/**
   * @param {string} key
   * @param {object} params
   * @param {object} opts
   */

	}, {
		key: 'validateSchemaEntry',
		value: function validateSchemaEntry(key, params, opts) {
			var _schemaKeys = _jsd_.schemaRef;
			if (!_exists(opts)) {
				opts = _schemaOptions.get(this);
			}
			if (!_exists(params)) {
				return key + ' was null or undefined';
			}
			if (typeof params === "boolean") {
				return true;
			}
			if (typeof params === "string") {
				return this.validateTypeString('' + key, params);
			}
			if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === "object") {
				// handled Objects with no `type` element
				if (!params.hasOwnProperty("type")) {
					return this.validateUntypedMembers(key, params);
				}
				// handles Classes/Functions
				if (_jsd_.getClass(params.type) == null) {
					return this.validateSchemaClass(key, params);
				}
				// handles child elements
				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = Object.keys(params)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var sKey = _step9.value;

						var _ = this.validateSchemaParam(key, sKey, _schemaKeys, params);
						if (typeof _ === "string") {
							return _;
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

				return true;
			}
			// handles non-object entries (Function, String, Number, Boolean, ...)
			else {
					var _t = typeof params === 'undefined' ? 'undefined' : _typeof(params);
					if (_t !== "function") {
						var _2 = _schemaKeys[key.split(".").pop()];
						// tests for everything that"s not a string, _object or function
						if (_2 !== _global.wf.wfUtils.Str.capitalize(_t)) {
							return 'value for schema element \'' + key + '\' has invalid type :: \'<' + _t + '>\'';
						}
					} else {
						var _3 = _global.wf.wfUtils.Fun.getConstructorName(params);
						// tests for function"s constructor name
						if (_3 !== _schemaKeys[key]) {
							return 'value for schema element \'' + key + '\' has invalid class or method \'<' + _3 + '>\'';
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

;
exports.SchemaValidator = SchemaValidator;