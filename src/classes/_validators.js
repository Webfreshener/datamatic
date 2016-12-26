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
//		this.polymorphic = _exists(signature.polymorphic);
		this.signature = signature;
//		this.__v = ValidatorBuilder.getValidators();
	}
	/**
	 * 
	 */
	call(path,value) {
		let _ = ValidatorBuilder.getValidators()[path];
		if (_exists(_) && typeof _ === "function") {
			return _(value);	}
		return `'${path}' has no validator defined`;
	}
	/**
	 * 
	 */
//	derivePolymorphic(signature, value) {
//    	let _attr = this.path.split(".").pop();
//    	// tests for element as child element on polymorphic object signature
//    	if (_exists(signature.elements[_attr])) {
//    		ValidatorBuilder.getInstance().create(signature.elements[_attr], this.path);
//        	return this.call(this.path, value);	}
//    	return `${this.path} was invalid`;
//	}
	/**
	 * 
	 */
	checkType(type, value) {
        if (_exists(type)) {
        	let _x = (typeof type !== "string") ? _schemaroller_.getClass([type]) : type;
        	if (_x.match(new RegExp(`^${typeof value}$`, "i")) === null) {
        		return `'${this.path}' expected ${type}, type was '<${typeof value}>'`	} }
        else {
        	return `type for ${this.path} was undefined`;	}
        return true;
	}
	/**
	 * 
	 */
	exec( value ) {
//		throw `${wf.utils.Fun.getClassName( this )} requires override of 'exec'`;
	}
}
/**
 * @private
 */
Validator.Object = class Obj extends BaseValidator {
	exec( value ) {
		let _iterate = (key, _val)=>{
			let _p = `${this.path}.${key}`;
			let _v = ValidatorBuilder.getValidators();
			if (!_v.hasOwnProperty(_p)) {
				ValidatorBuilder.create(this.signature.elements[key], _p);
			}
			let _ = this.call( _p, _val );
			if (typeof _ === "string") {
				return _;	}
		}
		if ( !Array.isArray( value ) ) {
			for (let _k in value) {
				let _res = _iterate(_k, value[_k]);
				if (typeof _res === "string") {
					return _res;
				}
			}
		}
		else {
			for (let _ in value) {
				let e = this.call( this.path, value[_] );
				if (typeof e === 'string') {
					return e; } }
		}
		return true;
	}
}
/**
 * @private
 */
Validator.Boolean = class Bool extends BaseValidator {
	exec( value ) {
		return this.checkType("boolean", value);
	}
}
/**
 * @private
 */
Validator.String = class Str extends BaseValidator {
	exec( value ) {
		let _;
        if (typeof (_ = this.checkType("string", value)) === "string") {
        	return _; }
		if (_exists(this.signature.restrict)) {
			if (!_exists(new RegExp(this.signature.restrict).exec( value ))) { 
				return `value '${value}' for ${this.path} did not match required expression`; } }
		return true;
	}
}
/**
 * @private
 */
Validator.Number = class Num extends BaseValidator {
	exec( value ) {
		let _ = this.checkType("number", value);
        if (typeof _ === "string") {
        	return _; }
        // attempts to cast to number
        return !isNaN( new Number( value ) ) ? true : `${this.path} was unable to process '${value}' as Number`;
	}
}
/**
 * @private
 */
Validator.Function = class Fun extends BaseValidator {
	exec( value ) {
        let _x = typeof this.signature.type === 'string' ? this.signature.type : _global.wf.wfUtils.Fun.getConstructorName(this.signature.type);
        let _fn = _global.wf.wfUtils.Fun.getConstructorName(value);
        return _x === _fn ? true : `${this.path} requires '$_x' got '<${_fn}>' instead`;
	}
}
/**
 * @private
 */
Validator.Default = class Def extends BaseValidator {
	exec( value ) {
	    var _x = typeof this.signature.type === 'string' ? _schemaroller_.getClass(this.signature.type) : this.signature.type;
        let _tR = this.checkType(_x, value);
        if (typeof _tR === "string") {
        	return _tR; }
	    if (Array.isArray(_x)) {
	      	let _ = _x.map( itm=> {
	      		let _clazz = _schemaroller_.getClass(itm);
	      		return (_exists(itm) && _exists(_clazz) && value instanceof _clazz);
	      	});
	      	return ( 0 <= _.indexOf(false) );	}
	    return (_exists(_x) && value instanceof _x);
    }
}
