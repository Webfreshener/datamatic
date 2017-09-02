/**
 * Strict JS Objects and Collections created from JSON Schema Definitions
 * @class JSD
 * @example let {Schema,Vector} = window.JSD();
 */
class JSD {
  constructor() {
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
   getClass(classesOrNames) {
	  let _k = _kinds.get(this);
	  if (!Array.isArray(classesOrNames)) {
		  classesOrNames = [classesOrNames]; }
	  // traverses arguemtns
	  for (let arg of classesOrNames) {
		if (typeof arg === "string") {
			return (0 <= Object.keys(_k).indexOf(arg)) ? arg.toLowerCase() : null;
			}
		// operates on object
	    if (typeof arg === "object") {
	      //- operates on arrays
	      if (Array.isArray(arg)) {
	    	//- holds the results set
	        let _r = [];
	        // traverses array elements
	        for (let n of arg) {
	          //- tests elements
	          switch (typeof n) {
	            //- operates on string
	            case "string":
	              // sets reference onto results
	              _r.push(this.getClass( n ));
	              break;
	            //-- operates on functions/classes
	            case "function":
	              //- sets function/class on results
	              _r.push(n);
	              break;
	            default:
	              //- handles nested arrays
	              _r.push( Array.isArray(n) ? this.getClass.apply(this, n) : null); 
	            } } //- end for/switch
	        return (0 <= _r.indexOf(null)) ? {_r : null} : undefined; } //- ends array handling
	      return null; } //- end typrof arg is object
	    if (typeof arg === "function") {
	    	let _ = _global.wf.Fun.getConstructorName( arg );
	    	return this.getClass( _ );  }
	    } //- end args in classesOrNames
	  return null;
	}
	/**
	 * @param {string} name
	 * @param {function} clazz
	 */
	registerClass(name, clazz) {
		this[name] = clazz;
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
		return Object.keys( _kinds.get(this) );
	}

	/**
	 * creates new Schema from JSON data
	 * @param {string|object} json
	 * @returns Schema
	 */
	fromJSON(json) {
		let _;
		if (_ = (typeof json).match( /^(string|object)+$/)) {
			return new Schema( (_[1] === "string") ? JSON.parse( json ) : json ); }
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
		    required: "Boolean",
		    extensible: "Boolean",
		    restrict: "String",
		    default: "*",
		    elements: ["Object","Array"],
		    polymorphic: {
		    	type: ["Object","Array"],
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
		 		    elements: ["Object","Array"]
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
	get defaults() {
		return {
			type: "*",
			required: false,
			extensible: false
		 };
	}
}
