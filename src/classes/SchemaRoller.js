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
	    let _k = _kinds.get(this);
	    return _exists(_k[arg]) ? _k[arg] : null; } //- end args in classesOrNames
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
		    validate: "Function",
		    default: "*",
		    elements: ["Array","Object"],
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
		 		    elements: ["Array","Object"]
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
	get defaults() {
		return {
			type: "*",
			required: false,
			extensible: false
		 };
	}
}
