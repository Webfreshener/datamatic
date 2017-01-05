Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var _schemaHelpers = new WeakMap();
var _schemaSignatures = new WeakMap();
var _required_elements = new WeakMap();
var _validators = new WeakMap();
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
		_data = Object.assign(_data, {
			_id: this._createID(),
			_className: _cName,
			_created: Date.now()
		});
		_mdRef.set(this, _data);
		_mdRef.set(_oRef, _data);
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
/**
 * @class Schema
 */


var Schema = function () {
	/**
  * @constructor
  * @param {Object} _o - schema definition object
  * @param {Object} opts - schema options
  */
	function Schema(_signature) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { extensible: false };

		_classCallCheck(this, Schema);

		var eMsg;
		if (!_exists(_signature)) {
			return 'Schema requires JSON object at arguments[0]. Got \'' + (typeof _signature === 'undefined' ? 'undefined' : _typeof2(_signature)) + '\'';
		}
		_object.set(this, {});
		_schemaOptions.set(this, opts);
		_validators.set(this, {});
		_required_elements.set(this, []);
		if (_exists(_signature.polymorphic)) {
			_signature = _signature.polymorphic;
		}
		// traverses elements of schema checking for elements marked as reqiured
		if (_exists(_signature.elements)) {
			_signature = _signature.elements;
		}

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = Object.keys(_signature)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _sigEl = _step3.value;

				// -- tests for element `required`
				var _req = _signature[_sigEl].required;
				if (_req) {
					// -- adds required element to list
					_required_elements.get(this).push(_sigEl);
				}
			}
			// tests for metadata
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

		if (!(this instanceof _metaData)) {
			var _ = void 0;
			if (!_exists(arguments[2])) {
				_ = new _metaData(this, {
					_path: "",
					_root: this });
			} else {
				_ = arguments[2] instanceof _metaData ? arguments[2] : new _metaData(this, arguments[2]);
			}
			_mdRef.set(this, _);
		}
		// attempts to validate provided `schema` entries
		var _schema_validator = new SchemaValidator(_signature, this.options);
		// throws error if error messagereturned
		if (typeof (eMsg = _schema_validator.isValid()) === 'string') {
			throw eMsg;
		}
		_schemaSignatures.set(this, _signature);
		_schemaHelpers.set(this, new SchemaHelpers(this));
		_schemaHelpers.get(this).walkSchema(_signature || {}, this.path);
	}
	/**
  * @returns schema signature object
  */


	_createClass(Schema, [{
		key: 'get',

		/**
   * @param {string} key
   * @returns {any}
   */
		value: function get(key) {
			var _ = _object.get(this);
			return _.hasOwnProperty(key) ? _[key] : null;
		}
		/**
   * sets value to schema key
   * @param {string|object} key
   * @param {any} value
   */

	}, {
		key: 'set',
		value: function set(key, value) {
			var _sH = _schemaHelpers.get(this);
			if ((typeof key === 'undefined' ? 'undefined' : _typeof2(key)) === 'object') {
				return _sH.setObject(key);
			}
			var _childSigs = this.signature.elements || this.signature;
			var _pathKeys = key.split(".");
			for (var _ in _pathKeys) {
				var _k2 = _pathKeys[_];
				var _schema = void 0;
				var _key = this.path.length > 0 ? this.path + '.' + _k2 : _k2;
				if (_exists(_childSigs[_k2])) {
					_schema = _childSigs[_k2];
				} else {
					// attempts to find wildcard element name
					if (_exists(_childSigs["*"])) {
						// applies schema
						_schema = _childSigs["*"].polymorphic || _childSigs["*"];
						// derives path for wildcard element
						var _pKey = this.path.length > 1 ? this.path + '.' + key : key;
						// creates Validator for path
						ValidatorBuilder.getInstance().create(_schema, _pKey);
					}
				}
				// handles missing schema signatures
				if (!_exists(_schema)) {
					// rejects non-members of non-extensible schemas
					if (!this.isExtensible) {
						return 'element \'' + _key + '\' is not a valid element';
					}
					_schema = Schema.defaultSignature;
				}
				// hanldes child objects
				if ((typeof value === 'undefined' ? 'undefined' : _typeof2(value)) === "object") {
					value = _sH.setChildObject(_key, value);
				}
				// handles absolute vaues (strings, numbers, booleans...)
				else {
						var eMsg = _sH.validate(_key, value);
						if (typeof eMsg === "string") {
							return eMsg;
						}
					}
				// applies value to schema
				var _o = _object.get(this);
				_o[key] = value;
				_object.set(this, _o);
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
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = ValidatorBuilder.getInstance().list()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _k = _step4.value;

					var e = void 0;
					_path = _path.length > 0 ? _path + '.' + _k : _k;
					if (typeof (e = _validate(_k, this.root.get(_k))) === 'string') {
						return e;
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

			return true;
		}
		/**
   * 
   */

	}, {
		key: 'valueOf',
		value: function valueOf() {
			return _object.get(this);
		}
		/**
   * 
   */

	}, {
		key: 'toJSON',
		value: function toJSON() {
			var _o = {};
			var _derive = function _derive(itm) {
				if (itm instanceof Schema) {
					return _derive(itm.toJSON());
				}
				if (itm instanceof Vector) {
					var _arr = [];
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = itm.valueOf()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var _k3 = _step5.value;

							_arr.push(_derive(itm[_k3]));
							return _arr;
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
				return itm;
			};
			var _obj = _object.get(this);
			for (var _k4 in _obj) {
				_o[_k4] = _derive(_obj[_k4]);
			}
			return _o;
		}
		/**
   * 
   */

	}, {
		key: 'toString',
		value: function toString() {
			var pretty = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			return JSON.stringify(this.toJSON(), null, pretty ? 2 : void 0);
		}
		/**
   * 
   */

	}, {
		key: 'signature',
		get: function get() {
			return _schemaSignatures.get(this);
		}
	}, {
		key: 'options',
		get: function get() {
			return _schemaOptions.get(this);
		}
		/**
   * @returns {string} Object ID for Schema
   */

	}, {
		key: 'objectID',
		get: function get() {
			return _mdRef.get(this)._id;
		}
		/**
   * @returns {Schema} elemetn at Schema root
   */

	}, {
		key: 'root',
		get: function get() {
			var _ = _mdRef.get(this).root;
			return _exists(_) ? _ : this;
		}
		/**
   * @returns {string} path to current Schema
   */

	}, {
		key: 'path',
		get: function get() {
			var _ = _mdRef.get(this).path;
			return _exists(_) ? _ : "";
		}
		/**
   * @returns {Schema} parent Schema element
   */

	}, {
		key: 'parent',
		get: function get() {
			var _ = _mdRef.get(this).root;
			return _exists(_) ? _ : this;
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
			//		return this.options.extensible;
			return _exists(this.signature.extensible) ? this.signature.extensible : this.options.extensible || false;
		}
		/**
   * 
   */

	}], [{
		key: 'defaultSignature',
		value: function defaultSignature() {
			return {
				type: "*",
				required: true,
				extensible: false
			};
		}
	}]);

	return Schema;
}();

;
/**
 * @class Vector
 */

var Vector = function () {
	/**
  * @constructor
  * @param {any} _type
  * @param {any} items
  */
	function Vector(_type) {
		_classCallCheck(this, Vector);

		_object.set(this, []);
		if (!_exists(_type)) {
			_type = ['*'];
		} else {
			if (!Array.isArray(_type)) {
				var _t = typeof _type === 'undefined' ? 'undefined' : _typeof2(_type);
				if (_t === 'string') {
					_type = [_type];
				}
				if (_t.match(/^(function|object)$/)) {
					_type = [_type];
				}
				if (!_exists(_t) || _t === 'Function') {
					_type = ['*'];
				}
			}
		}
		// when we no longer need babel...
		// type = _type;
		// for now we use Weakmap
		_vectorTypes.set(this, _type);
		// add all items into collection

		for (var _len = arguments.length, items = Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
			items[_key2 - 1] = arguments[_key2];
		}

		if (items != null) {
			this.push(items);
		}
	}
	/**
  * tests item to see if it conforms to expected item type
  */


	_createClass(Vector, [{
		key: '_typeCheck',
		value: function _typeCheck(item) {
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = this.type[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var _t = _step6.value;

					if (typeof _t === 'string' && _t.match(/^(\*|ALL)$/)) {
						return true;
					}
					if (!(_t = _schemaroller_.getClass(_t))) {
						return false;
					}
					if (!_global.wf.wfUtils.Obj.isOfType(item, _t)) {
						return false;
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

			return true;
		}
		/**
   * validates items in Vector list
   * @returns {boolean}
   */

	}, {
		key: 'validate',
		value: function validate() {
			var _path = this.path();
			var _validator = ValidatorBuilder.getInstance();
			_object.get(this).forEach(function (itm) {
				var e = void 0;
				if (typeof (e = _validator.exec(_path, itm)) === 'string') {
					return e;
				}
			});
			return true;
		}
		/**
   * @param {number} idx
   * @returns {any} element at index if found
   */

	}, {
		key: 'getItemAt',
		value: function getItemAt(idx) {
			return (_object.get(this).length = idx + 1) ? _object.get(this)[idx] : null;
		}
		/**
  * @param {number} idx
  * @param {any} item
  * @returns {Vector} reference to self
  */

	}, {
		key: 'setItemAt',
		value: function setItemAt(idx, item) {
			if (!this._typeCheck(item)) {
				return false;
			}
			_object.get(this).splice(idx, 0, item);
			return this;
		}
		/**
   * @param {number} idx
   * @param {any} item
   * @returns {any} item removed
   */

	}, {
		key: 'removeItemAt',
		value: function removeItemAt(idx, item) {
			if (idx > _object.get(this).length) {
				return false;
			}
			return _object.get(this).splice(idx, 1, item);
		}
		/**
   * @param {Array} array
   * @returns {Vector} reference to self
   */

	}, {
		key: 'replaceAll',
		value: function replaceAll(array) {
			this.reset();
			for (var itm in array) {
				this.addItem(array[itm]);
			}
			return this;
		}
		/**
   * @param {number} idx
   * @param {any} item
   * @returns {Vector} reference to self
   */

	}, {
		key: 'replaceItemAt',
		value: function replaceItemAt(idx, item) {
			if (!this._typeCheck(item)) {
				return false;
			}
			if (idx > _object.get(this).length) {
				return false;
			}
			if (idx <= _object.get(this).length) {
				_object.get(this).splice(idx, 1);
			}
			return this;
		}
		/**
   * @param {any} item
   * @returns {Vector} reference to self
   */

	}, {
		key: 'addItem',
		value: function addItem(item) {
			return this.setItemAt(_object.get(this).length, item);
		}
		/**
   * @returns {any} item removed from start of list
   */

	}, {
		key: 'shift',
		value: function shift() {
			return _object.get(this).shift();
		}
	}, {
		key: 'unshift',

		/**
   * @param {any} items to be added
   * @returns {Vector} reference to self
   */
		value: function unshift() {
			var _this = this;

			for (var _len2 = arguments.length, items = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
				items[_key3] = arguments[_key3];
			}

			items.forEach(function (item) {
				return _this.setItemAt(0, item);
			});
			return this;
		}
		/**
   * @returns {any} items removed from end of list
   */

	}, {
		key: 'pop',
		value: function pop() {
			return _object.get(this).shift();
		}
		/**
   * @param {any} items to be added at end of list
   * @returns {Vector} reference to self
   */

	}, {
		key: 'push',
		value: function push() {
			var _this2 = this;

			for (var _len3 = arguments.length, items = Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
				items[_key4] = arguments[_key4];
			}

			items.forEach(function (item) {
				return _this2.addItem(item);
			});
			return this;
		}
		/**
   * resets list to empty array
   * @returns reference to self
   */

	}, {
		key: 'reset',
		value: function reset() {
			_object.set(this, []);
			return this;
		}
		/**
   * @param {function} func - sorrting function
   * @returns {Vector} reference to self
   */

	}, {
		key: 'sort',
		value: function sort(func) {
			_object.get(this).sort(func);
			return this;
		}
		/**
   * @returns primitive value of list
   */

	}, {
		key: 'valueOf',
		value: function valueOf() {
			return _object.get(this);
		}
		/**
   * @returns stringified representation of list
   */

	}, {
		key: 'toString',
		value: function toString() {
			return _object.get(this).toString();
		}
		/**
   * getter for Vector type
   * @returns 
   */

	}, {
		key: 'type',
		get: function get() {
			// for when we no longer need babel
			// return type;
			return _vectorTypes.get(this);
		}
		/**
   * @returns Unique ObjectID
   */

	}, {
		key: 'objectID',
		get: function get() {
			return _mdRef.get(this).get('_id');
		}
		/**
   * 
   */

	}, {
		key: 'root',
		get: function get() {
			return _mdRef.get(this).get('_root');
		}
		/**
   * 
   */

	}, {
		key: 'path',
		get: function get() {
			return _mdRef.get(this).path;
		}
		/**
   * 
   */

	}, {
		key: 'parent',
		get: function get() {
			var _root = void 0;
			if (!(((_root = this.root()) != null) instanceof Schema) && !(_root instanceof Vector)) {
				return null;
			}
			return _root.get(this.path().split('.').pop().join('.'));
		}
		/**
   * @returns {number} number of elements in list
   */

	}, {
		key: 'length',
		get: function get() {
			return this.valueOf().length;
		}
	}]);

	return Vector;
}();

var Validator = {};
/**
 * @private
 */

var BaseValidator = function () {
	/**
  * @constructor
  */
	function BaseValidator(path, signature) {
		_classCallCheck(this, BaseValidator);

		this.path = path;
		this.signature = signature;
	}
	/**
  * 
  */


	_createClass(BaseValidator, [{
		key: 'call',
		value: function call(path, value) {
			var _ = ValidatorBuilder.getValidators()[path];
			if (_exists(_) && typeof _ === "function") {
				return _(value);
			}
			return '\'' + path + '\' has no validator defined';
		}
		/**
   * 
   */

	}, {
		key: 'checkType',
		value: function checkType(type, value) {
			var _this3 = this;

			_eval = function _eval(type, value) {
				var _x = typeof type !== "string" ? _schemaroller_.getClass([type]) : type;
				if (_x.match(new RegExp('^' + (typeof value === 'undefined' ? 'undefined' : _typeof2(value)) + '$', "i")) === null) {
					return '\'' + _this3.path + '\' expected ' + type + ', type was \'<' + (typeof value === 'undefined' ? 'undefined' : _typeof2(value)) + '>\'';
				}
				return true;
			};
			if (_exists(type)) {
				if (Array.isArray(type)) {
					var _ = null;
					for (k in type) {
						if (typeof (_ = _eval(type[k], value)) === "boolean") {
							return _;
						}
					}
					return _;
				}
				return _eval(type, value);
			} else {
				return 'type for ' + this.path + ' was undefined';
			}
			return true;
		}
		/**
   * 
   */

	}, {
		key: 'exec',
		value: function exec(value) {
			return wf.utils.Fun.getClassName(this) + ' requires override of \'exec\'';
		}
	}]);

	return BaseValidator;
}();
/**
 * @private
 */


Validator.Object = function (_BaseValidator) {
	_inherits(Obj, _BaseValidator);

	function Obj() {
		_classCallCheck(this, Obj);

		return _possibleConstructorReturn(this, (Obj.__proto__ || Object.getPrototypeOf(Obj)).apply(this, arguments));
	}

	_createClass(Obj, [{
		key: 'exec',
		value: function exec(value) {
			var _this5 = this;

			var _iterate = function _iterate(key, _val) {
				var _p = _this5.path + '.' + key;
				var _v = ValidatorBuilder.getValidators();
				if (!_v.hasOwnProperty(_p)) {
					ValidatorBuilder.create(_this5.signature.elements[key], _p);
				}
				var _ = _this5.call(_p, _val);
				if (typeof _ === "string") {
					return _;
				}
			};
			if ((typeof value === 'undefined' ? 'undefined' : _typeof2(value)) === "object") {
				if (!Array.isArray(value)) {
					for (var _k in value) {
						var _res = _iterate(_k, value[_k]);
						if (typeof _res === "string") {
							return _res;
						}
					}
				} else {
					for (var _ in value) {
						var e = this.call(this.path, value[_]);
						if (typeof e === 'string') {
							return e;
						}
					}
				}
				return true;
			} else {
				return this.path + ' expected value of type \'Object\'. Type was \'<' + (typeof value === 'undefined' ? 'undefined' : _typeof2(value)) + '>\'';
			}
			// should never hit this
			return this.path + ' was unable to be processed';
		}
	}]);

	return Obj;
}(BaseValidator);
/**
 * @private
 */
Validator.Boolean = function (_BaseValidator2) {
	_inherits(Bool, _BaseValidator2);

	function Bool() {
		_classCallCheck(this, Bool);

		return _possibleConstructorReturn(this, (Bool.__proto__ || Object.getPrototypeOf(Bool)).apply(this, arguments));
	}

	_createClass(Bool, [{
		key: 'exec',
		value: function exec(value) {
			return this.checkType("boolean", value);
		}
	}]);

	return Bool;
}(BaseValidator);
/**
 * @private
 */
Validator.String = function (_BaseValidator3) {
	_inherits(Str, _BaseValidator3);

	function Str() {
		_classCallCheck(this, Str);

		return _possibleConstructorReturn(this, (Str.__proto__ || Object.getPrototypeOf(Str)).apply(this, arguments));
	}

	_createClass(Str, [{
		key: 'exec',
		value: function exec(value) {
			var _ = void 0;
			if (typeof (_ = this.checkType("string", value)) === "string") {
				return _;
			}
			if (_exists(this.signature.restrict)) {
				if (!_exists(new RegExp(this.signature.restrict).exec(value))) {
					return 'value \'' + value + '\' for ' + this.path + ' did not match required expression';
				}
			}
			return true;
		}
	}]);

	return Str;
}(BaseValidator);
/**
 * @private
 */
Validator.Number = function (_BaseValidator4) {
	_inherits(Num, _BaseValidator4);

	function Num() {
		_classCallCheck(this, Num);

		return _possibleConstructorReturn(this, (Num.__proto__ || Object.getPrototypeOf(Num)).apply(this, arguments));
	}

	_createClass(Num, [{
		key: 'exec',
		value: function exec(value) {
			var _ = this.checkType("number", value);
			if (typeof _ === "string") {
				return _;
			}
			// attempts to cast to number
			return !isNaN(new Number(value)) ? true : this.path + ' was unable to process \'' + value + '\' as Number';
		}
	}]);

	return Num;
}(BaseValidator);
/**
 * @private
 */
Validator.Function = function (_BaseValidator5) {
	_inherits(Fun, _BaseValidator5);

	function Fun() {
		_classCallCheck(this, Fun);

		return _possibleConstructorReturn(this, (Fun.__proto__ || Object.getPrototypeOf(Fun)).apply(this, arguments));
	}

	_createClass(Fun, [{
		key: 'exec',
		value: function exec(value) {
			var _x = typeof this.signature.type === 'string' ? this.signature.type : _global.wf.wfUtils.Fun.getConstructorName(this.signature.type);
			var _fn = _global.wf.wfUtils.Fun.getConstructorName(value);
			return _x === _fn ? true : this.path + ' requires \'$_x\' got \'<' + _fn + '>\' instead';
		}
	}]);

	return Fun;
}(BaseValidator);
/**
 * @private
 */
Validator.Default = function (_BaseValidator6) {
	_inherits(Def, _BaseValidator6);

	function Def() {
		_classCallCheck(this, Def);

		return _possibleConstructorReturn(this, (Def.__proto__ || Object.getPrototypeOf(Def)).apply(this, arguments));
	}

	_createClass(Def, [{
		key: 'exec',
		value: function exec(value) {
			var _this11 = this;

			_testValidator = function _testValidator(type, value) {
				var _val = Validator[_global.wf.wfUtils.Str.capitalize(type)];
				if (!_exists(_val)) {
					return '\'' + _this11.path + '\' was unable to obtain validator for type \'<' + type + '>\'';
				}
				var _ = new _val(_this11.path, _this11.signature);
				return _.exec(value);
			};
			var _x = typeof this.signature.type === 'string' ? _schemaroller_.getClass(this.signature.type) : this.signature.type;
			var _tR = this.checkType(_x, value);
			if (typeof _tR === "string") {
				return _tR;
			}
			if (Array.isArray(_x)) {
				var _ = _x.map(function (itm) {
					var _clazz = _schemaroller_.getClass(itm);
					return _testValidator(_clazz, value);
				});
				return 0 <= _.indexOf(true) ? true : _[_.length - 1];
			}
			return _testValidator(type, value);
		}
	}]);

	return Def;
}(BaseValidator);
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
		var _iteratorNormalCompletion7 = true;
		var _didIteratorError7 = false;
		var _iteratorError7 = undefined;

		try {
			for (var _iterator7 = _iterate[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
				var _oKey = _step7.value;

				switch (_typeof2(_schema[_oKey])) {
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
								var _iteratorNormalCompletion8 = true;
								var _didIteratorError8 = false;
								var _iteratorError8 = undefined;

								try {
									for (var _iterator8 = Object.keys(_schema[_oKey])[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
										var _x = _step8.value;

										if (typeof (_errorMsg = this.validateSchemaEntry(_x, _schema[_oKey][_x])) === "string") {
											return _errorMsg;
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
							}
						} else {
							var _iteratorNormalCompletion9 = true;
							var _didIteratorError9 = false;
							var _iteratorError9 = undefined;

							try {
								for (var _iterator9 = _schema[_oKey][Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
									var _s = _step9.value;

									if (typeof _schema[_oKey][_s] === "string") {
										_errorMsg = this.validateTypeString(_oKey, _schema[_oKey][_s]);
									} else {
										_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey][_s]);
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
						break;
					case "boolean":
						_errorMsg = this.validateSchemaEntry(_oKey, _schema[_oKey]);
						break;
					default:
						_errorMsg = 'value for schema element \'' + _oKey + '\' was invalid';}
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
				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = params[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var item = _step10.value;

						var _res;
						if (typeof (_res = this.validateSchemaEntry(key, item)) === "string") {
							return _res;
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
					var _iteratorNormalCompletion11 = true;
					var _didIteratorError11 = false;
					var _iteratorError11 = undefined;

					try {
						for (var _iterator11 = Object.keys(params)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
							var param = _step11.value;

							var _res;
							var _keys = [].concat(keyPath).concat(param);
							if (typeof (_res = this.validateSchemaEntry('' + _keys.join("."), params[param])) === "string") {
								return _res;
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
				throw 'string expected for argument \'key\'. Type was \'<' + (typeof key === 'undefined' ? 'undefined' : _typeof2(key)) + '>\'';
			}
			if (!_exists(params)) {
				throw "params was undefined";
			}
			if ((typeof params === 'undefined' ? 'undefined' : _typeof2(params)) !== "object") {
				throw 'object expected for argument \'params\'. Type was \'<' + (typeof params === 'undefined' ? 'undefined' : _typeof2(params)) + '>\'';
			}
			if (params.type === "*") {
				return true;
			}
			if (Object.keys(params).length === 0) {
				return true;
			}
			if (_typeof2(params.type) === "object") {
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
			if (_typeof2(_schemaKeys[sKey]) === "object") {
				// handles `elements` object
				if (sKey === "elements") {
					var _iterate2 = Array.isArray(params.elements) ? params.elements : Object.keys(params.elements);
					var _iteratorNormalCompletion12 = true;
					var _didIteratorError12 = false;
					var _iteratorError12 = undefined;

					try {
						for (var _iterator12 = _iterate2[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
							var xKey = _step12.value;

							var eMsg = this.validateSchemaEntry(key + '.' + xKey, params.elements[xKey]);
							if (typeof eMsg === "string") {
								return eMsg;
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
			var _schemaKeys = _schemaroller_.schemaRef;
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
			if ((typeof params === 'undefined' ? 'undefined' : _typeof2(params)) === "object") {
				// handled Objects with no `type` element
				if (!params.hasOwnProperty("type")) {
					return this.validateUntypedMembers(key, params);
				}
				// handles Classes/Functions
				if (_schemaroller_.getClass(params.type) == null) {
					return this.validateSchemaClass(key, params);
				}
				// handles child elements
				var _iteratorNormalCompletion13 = true;
				var _didIteratorError13 = false;
				var _iteratorError13 = undefined;

				try {
					for (var _iterator13 = Object.keys(params)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
						var sKey = _step13.value;

						var _ = this.validateSchemaParam(key, sKey, _schemaKeys, params);
						if (typeof _ === "string") {
							return _;
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

				return true;
			}
			// handles non-object entries (Function, String, Number, Boolean, ...)
			else {
					var _t = typeof params === 'undefined' ? 'undefined' : _typeof2(params);
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
  * 
  */


	_createClass(SchemaHelpers, [{
		key: 'setObject',
		value: function setObject(obj) {
			obj = this.ensureRequiredFields(obj);
			if (typeof obj === 'string') {
				return obj;
			}
			// calls set with nested key value pair
			for (var k in obj) {
				var eMsg = this._ref.set(k, obj[k]);
				if (typeof eMsg === 'string') {
					return eMsg;
				}
			}
			return this._ref;
		}
		/**
   * 
   */

	}, {
		key: 'setChildObject',
		value: function setChildObject(key, value) {
			var _mdData = {
				_path: key, //`${this._ref.path}.${key}`,
				_root: this._ref.root
			};
			var _s = this.createSchemaChild(key, value, this._ref.options, _mdData);
			if (!_exists(_s) || (typeof _s === 'undefined' ? 'undefined' : _typeof2(_s)) !== "object") {
				return '\'' + key + '\' was invalid';
			}
			return _s[_s instanceof Vector ? "replaceAll" : "set"](value);
		}
		/**
   * @param {Object} itm
   * @returns {String|false}
   */

	}, {
		key: 'ensureKindIsString',
		value: function ensureKindIsString(itm) {
			switch (typeof itm === 'undefined' ? 'undefined' : _typeof2(itm)) {
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
		/**
   * tests if required fields exist on object
   * @param {Object} obj
   * @returns {true|string} - returns true or error string
   */

	}, {
		key: 'ensureRequiredFields',
		value: function ensureRequiredFields(obj) {
			var oKeys = Object.keys(obj);
			var _required = this._ref.requiredFields;
			for (var _ in _required) {
				var _key = _required[_];
				var _path = this._ref.path.length ? this._ref.path : "root element";
				if (0 > oKeys.indexOf(_key)) {
					if (_exists(this._ref.signature[_key].default)) {
						obj[_key] = this._ref.signature[_key].default;
					} else {
						return 'required property \'' + _key + '\' is missing for \'' + _path + '\'';
					}
				}
			}
			return obj;
		}
		/**
   * @param {Object} value
   * @param {_metaData} metaData
   */

	}, {
		key: 'createSchemaChild',
		value: function createSchemaChild(key, value, opts, metaData) {
			var _kinds;
			// tests if value is not Array
			if (!Array.isArray(value)) {
				var _md = new _metaData(this._ref, metaData || {
					_path: key, //`${this._ref.path}.${key}`,
					_root: this._ref.root
				});
				var _schemaDef = this._ref.signature[key] || this._ref.signature['*'] || this._ref.signature;
				return new Schema(_schemaDef, opts, _md);
			} else {
				_kinds = this.getKinds(this._ref.signature[key] || this._ref.signature);
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
		/**
   * builds validations from SCHEMA ENTRIES
   * @private
   */

	}, {
		key: 'walkSchema',
		value: function walkSchema(obj, path) {
			var result = [];
			var _map = function _map(itm, objPath) {
				return _walkSchema(itm, objPath);
			};
			var _elements = Array.isArray(obj) ? obj : Object.keys(obj);
			for (var _i in _elements) {
				var _k = _elements[_i];
				var itm = void 0;
				var objPath = _exists(path) ? path.length ? path + '.' + _k : _k : _k || "";
				ValidatorBuilder.getInstance().create(obj[_k], objPath);
				// tests for nested elements
				if (_exists(obj[_k]) && _typeof2(obj[_k].elements) === "object") {

					if (!Array.isArray(obj[_k].elements)) {
						result.push(this.walkSchema(obj[_k].elements, objPath));
					} else {
						result.push(_map(obj[_k].elements, objPath));
					}
				}
			}
			return result;
		}
		/**
   * @private
   */

	}, {
		key: 'objHelper',
		value: function objHelper(_schema, opts) {
			var _kinds = this.getKinds(_schema);
			if (Array.isArray(_kinds)) {
				_kinds = _kinds.map(function (itm) {
					switch (typeof itm === 'undefined' ? 'undefined' : _typeof2(itm)) {
						case "string":
							return itm;
							break;
						case "object":
							if (itm.hasOwnProperty('type')) {
								return itm.type;
							}
							break;
					}
					return null;
				});
				_kinds = _kinds.filter(function (itm) {
					return _exists(itm);
				});
				_kinds = _kinds.length ? _kinds : '*';
				return new Vector(_kinds || '*');
			}
			return null;
		}
		/**
   * @param {string} key
   * @param {object} object to validate
   */

	}, {
		key: 'validate',
		value: function validate(key, value) {
			var _list = ValidatorBuilder.getInstance().list();
			var _ref;
			//-- attempts to validate
			if (!key.length) {
				// and @ instanceof _metaData
				return 'invalid path \'' + key + '\'';
			}
			// key = if value instanceof _metaData then value.get( '_path' ) else value.getpath
			// return "object provided was not a valid subclass of Schema" unless value instanceof Schema
			// return "object provided was malformed" unless typeof (key = value.getPath?()) is 'string'
			var msg = void 0;
			if (0 <= _list.indexOf(key)) {
				var _path = [];
				var iterable = key.split('.');
				var _p;
				var _iteratorNormalCompletion14 = true;
				var _didIteratorError14 = false;
				var _iteratorError14 = undefined;

				try {
					for (var _iterator14 = iterable[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
						var _k = _step14.value;

						_path.push(_k);
						_p = _path.join('.');
						if (0 > _list.indexOf(_p)) {
							_path.push('*');
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

				if (!(_ref = ValidatorBuilder.getInstance().get(_p))) {
					if (!this.options.extensible) {
						return '\'' + key + '\' is not a valid schema property';
					}
				}
				ValidatorBuilder.getInstance().set(key, _ref);
			}
			if (typeof (msg = ValidatorBuilder.getInstance().exec(key, value)) === 'string') {
				return msg;
			}
			return true;
		}
		/**
   * @returns {array} list of types decalred by object
   */

	}, {
		key: 'getKinds',
		value: function getKinds(_s) {
			var _elems = Object.keys(_s).map(function (key) {
				return key === "type" ? _s.type : _exists(_s[key].type) ? _s[key].type : null;
			});
			_elems = _elems.filter(function (elem) {
				return elem !== null;
			});
			return _elems.length ? _elems : null;
		}
	}]);

	return SchemaHelpers;
}();

;
exports.Schema = Schema;