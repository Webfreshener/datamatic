/////////////////////////////////////////////////
// SchemaRoller
// (c)2015-2016 Van Carney <carney.van@gmail.com>
/////////////////////////////////////////////////
// references the global scope of our environment
const _global = (typeof exports !== 'undefined') && (exports !== null) ? exports : window;
/**
 * @private
 */
_global.SchemaRoller = ()=> {
  'use strict';
  const _object = new WeakMap();
  const _mdRef  = new WeakMap();
  const _required_elements = new WeakMap();
  const _validators = new WeakMap();
  //-- inject:./classes/_schemaValidator.js
  //-- inject:./classes/_validatorBuilder.js
  //-- inject:./classes/Vector.js
  //-- inject:./classes/_schemaHelper.js
  //-- inject:./classes/Schema.js
  //-- inject:./classes/_metaData.js
  let _schemaroller_ = new SchemaRoller;
  _schemaroller_.registerClass('Schema', _schemaroller_.Schema = Schema);
  _schemaroller_.registerClass('Vector', _schemaroller_.Vector = Vector);
  let _sKeys = Object.keys(_schemaroller_.schemaRef);
  if (_schemaroller_.rx === null) { 
	  _schemaroller_.rx = new RegExp( `^((${_sKeys.join('|')})+,?){${_sKeys.length}}$` ); }
  return _schemaroller_;
};
//polyfills Object.assign
if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    if (target == null) { 
    	throw new TypeError('Cannot convert undefined or null to object'); }
    target = Object(target);
    let index  = 1;
    while (index < arguments.length) {
      let source = arguments[index];
      if (source != null) {
        for (let key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]; } } }
      index = index + 1; }
    return target; }
}
//-- inject:./wfUtils.js
let _exists = _global.wf.wfUtils.exists
//== holds references to registered JS Objects
let _kinds = new WeakMap() || {};
/**
 * Strict JS Objects and Collections created from JSON Schema Defintions
 * @class SchemaRoller
 * @example let {Schema,Vector} = window.SchemaRoller();
 */
class SchemaRoller {
  constructor() {
    _kinds.set(this, {
      Array,
      ArrayBuffer,
      Boolean,
      Buffer:ArrayBuffer,
      Date,
      Number,
      Object,
      String,
      Function
    });
  } 
  /**
   * @param {string|function} classesOrNames
   * @returns {function}
   */
   getClass(...classesOrNames) {
	  // traverses arguemtns
	  for (let arg of classesOrNames) {
		// operates on object
	    if (typeof arg === 'object') {
	      //- operates on arrays
	      if (Array.isArray(arg)) {
	    	//- holds the results set
	        let _r = [];
	        // traverses array elements
	        for (let n of arg) {
	          //- tests elements
	          switch (typeof n) {
	            //- operates on string
	            case 'string':
	              // sets reference onto results
	              _r.push(this.getClass( n ));
	              break;
	            //-- operates on functions/classes
	            case 'function':
	              //- sets function/class on results
	              _r.push(n);
	              break;
	            default:
	              //- handles nested arrays
	              _r.push( Array.isArray(n) ? this.getClass.apply(this, n) : null); 
	            } } //- end for/switch
	        return (0 <= _r.indexOf(null)) ? {_r : null} : undefined; } //- ends array handling
	      return null; } //- end typrof arg is object
	    return (_kinds.get(this)[arg] !== null) ? _kinds[arg] : null; } //- end args in classesOrNames
	  return null;
	}
	/**
	 * @param {string} name
	 * @param {function} clazz
	 */
	registerClass(name, clazz) {
		return _kinds.get(this)[name] = clazz;
	}
	/**
	 * @param {string} name
	 */
	unregisterClass(name) {
	  if (_kinds.hasOwnProperty(name)) { 
		  return delete _kinds.get(this)[name]; }
	  return false
	}
	/**
	 * @return list of registered Class Names
	 */
	listClasses() {
		Object.keys(_kinds.get(this));
	}
	/**
	 * creates new Schema from JSON data
	 * @param {string|object} json
	 * @returns Schema
	 */
	fromJSON(json) {
	  if (_r = (typeof json).match( /^(string|object)+$/)) {
	    return new Schema( (_r[1] === 'string') ? JSON.parse(json) : json ); }
	  throw new Error("json must be either JSON formatted string or object");
	}
	/**
	 * @returns {object} base schema element signature
	 */
	get schemaRef() {
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
		    elements: ['Array','Object']
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
	get defaults() {
		return {
			type: '*',
			required: false,
			extensible: false
		 };
	}
}
// injects NPM Modules
//-- inject:../include/index.js
