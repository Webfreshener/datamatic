const Validator = {};
/**
 * @private
 */
class BaseValidator {
	/**
	 * @constructor
	 */
	constructor(path, signature) {
		this.path = path;
		this.signature = signature;
		this.__v = ValidatorBuilder.getValidators();
	}
	iterate(value, evaluator) {
		var _result
		if ((!_exists(evaluator)) || (typeof evaluator !== "function")) {
			return `iterate requires function at argument[1]`;	}
		for (let _signature of this.signature) {
//			console.log(`${this.path} _signature: ${JSON.stringify(_signature, null)}`);
			if ((_result = evaluator(_signature, value)) === true) {
				return _result;	}	}
		return _result;
	}
	/**
	 * 
	 */
	call(path,value) {
		let ___v = this.__v[this.path];
		if (_exists(___v)) {
			return ___v(value);	}
		return `'${path}' has no validator defined`;
	}
	derivePolymorphic(signature, value) {
    	let _attr = this.path.split(".").pop();
    	// tests for element as child element on polymorphic object signature
    	if (_exists(signature.elements[_attr])) {
    		ValidatorBuilder.getInstance().create(signature.elements[_attr], this.path);
        	return this.call(this.path, value);	}
    	return `${path} was invalid`;
	}
	/**
	 * 
	 */
	exec( value ) {
		throw `${wf.utils.Fun.getClassName( this )} requires override of 'exec'`;
	}
}
/**
 * @private
 */
Validator.Object = class Object extends BaseValidator {
	exec( value ) {
		console.log(`exec on '${this.path}'`);
		return this.iterate( value, (_signature, value)=> {
			if ( !Array.isArray( value ) ) {
				return this.call( this.path, this.value ); }
			else {
				for (let _ in this.value) {
					let e = this.call( this.path, this.value[_] );
					if (typeof e === 'string') {
						return e; } }
			}
			return true;
		});
	}
}
/**
 * @private
 */
Validator.String = class String extends BaseValidator {
	exec( value ) {
		return this.iterate( value, (signature, value)=> {
			var _x;
//			console.log( signature)
			if (typeof signature === 'object') {
				// ensures param `type` is never undefined
				_x = _exists(signature.type) ? signature.type : null; }
			if (!_exists( _x )) {
				_x = signature; }
	        if (_x === 'Object') {
	        	console.log("string validator got an object signature");
	        	return this.derivePolymorphic(signature, value);	}
			if (signature !== 'String' && !_x.match(/^string$/i)) { 
				return `${this.path} requires ${_x} type was '<String>'`; }
			if (_exists(signature.restrict)) {
				if (!_exists(new RegExp(signature.restrict).exec( value ))) { 
					return `value '${value}' for ${this.path} did not match required expression`; } }
			return true;
		});
	}
}
/**
 * @private
 */
Validator.Number = class Number extends BaseValidator {
	exec( value ) {
		return this.iterate( value, (signature, value)=> {
			let _;
	        var _x;
	        if (_exists(signature.type)) {
	        	_x = (typeof signature.type !== 'string') ? _schemaroller_.getClass(signature.type) : signature.type;
	        }
	        // references base signature if `type` element was not present
	        if (!_exists( _x )) { 
	      	  _x = signature;	}
	        // tests if `type` is Number
	        if (_x === 'Number') { 
	      	  return true; }
	        // -- is it polymorphic?
	        if (_x === 'Object') {
	        	return this.derivePolymorphic(signature, value);	}
	        // returns error string if type was Function that was not Number constructor
	        if ((_ = _global.wf.wfUtils.Fun.getFunctionName(_x)) !== 'Number') { 
	      	  return `'${this.path}' expected ${_}, type was '<Number>'`; }
	        // attempts to cast to number
	        return !isNaN( new _x( value ) );
		});
	}
}
/**
 * @private
 */
Validator.Function = class Function extends BaseValidator {
	exec( value ) {
		return this.iterate( value, (signature, value)=> {
	        var _x = typeof signature === 'string' ? signature : _global.wf.wfUtils.Fun.getConstructorName(signature);
	        if (_x === 'Object') {
	        	return this.derivePolymorphic(signature, value);	}
	        return _x === _global.wf.wfUtils.Fun.getConstructorName(value);
		});
	}
}
/**
 * @private
 */
Validator.Default = class Default extends BaseValidator {
	exec( value ) {
		return this.iterate( value, (signature, value)=> {
		    var _x = typeof signature.type === 'string' ? _schemaroller_.getClass(signature.type) : signature.type;
		    if (Array.isArray(_x)) {
		      	let _ = _x.map( itm=> {
		      		let _clazz = _schemaroller_.getClass(itm);
		      		return (_exists(itm) && _exists(_clazz) && value instanceof _clazz);
		      	});
		      	return ( 0 <= _.indexOf(false) );	}
		    return (_exists(_x) && value instanceof _x);
		});
    }
}
