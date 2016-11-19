/**
 * @private
 */
class SchemaHelpers {
	/**
	 * @constructor
	 */
	constructor() {
		
	}
	/**
	 * @param {Object} itm
	 * @returns {String|false}
	 */
	ensureKindIsString(itm) {
	    switch (typeof itm) {
	      case 'string':
	        return itm;
	      case 'object':
	        if (itm.hasOwnProperty('type')) { 
	        	return itm.type; }
	        break;
	    }
	    return false;
	};
	/**
	 * tests if required fields exist on object
	 * @param {Object} obj
	 * @returns {true|string} - returns true or error string
	 */
    // helper method to test if field requirements are met
    hasRequiredFields(obj) {
      let oKeys = Object.keys( obj );
      for (let key of _required_elements) {
//        _path = (_path = this.path()).length ? _path : 'root element';
        if (0 > oKeys.indexOf(key)) {
          return `required property '${key}' is missing`;}}
      return true;
    };
	/**
	 * @param {Object} value
	 * @param {_metaData} metaData
	 */
	createSchemaChild(value, metaData) {
	  var _kinds;
	  // tests if value is not Array
	  if (!Array.isArray(value)) {
	      let _opts = {extensible: _extensible};
	      let _md = new _metaData(this, {
	    	  _path: _key,
	    	  _root: this.root()
	      });
	      let _schemaDef = _exists( _schema.elements ) ? _schema.elements : _schema
	      return new Schema( _schemaDef, _opts, metaData); }
	  else {
		  _kinds = _getKinds( _schema );
	      if (Array.isArray(_kinds)) {
	        _kinds = _kinds.map( this.ensureKindIsString( value ) );
	        _kinds = _kinds.filter( itm=> itm !== null );
	        _kinds = _kinds.length ? _kinds : '*';
	        return new Vector((_kinds || '*'), metaData); }
	  }
	  return "unable to process value";
	};
}
