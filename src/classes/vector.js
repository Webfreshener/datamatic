/**
 * @class Vector
 */
class Vector {
	/**
	 * @constructor
	 * @param {any} _type
	 * @param {any} items
	 */
	constructor(_type, ...items) {
		_object.set(this,  []);
		if (!Array.isArray(_type)) {
	      let _t = typeof _type;
	      if (_t === 'string') { _type = [_type]; }
	      if (_t.match(/^(function|object)$/)) { _type = [_type]; }
	      if (_t === null || _t === 'Function') { _type = ['*']; }
	    }
	    let _check = function(item){
	      for (let _t of _type) {
	        if ((typeof _t === 'string') && _t.match(/^(\*|ALL)$/)) { return true; }
	        if (!(_t = _schemaroller_.getClass(_t))) { return false; }
	        if (!_global.wf.wfUtils.Obj.isOfType(item, _t)) { return false; }
	      }
	      return true;
	    };
	    // add all items into collection
	    if (items != null) { this.push(items); }
	 }
	/**
	 * validates items in Vector list
	 * @returns {boolean}
	 */
	validate() {
	  let _path = this.path();
	  let _validator = ValidatorBuilder.getInstance();
	  _object.get(this).forEach(itm=> {
	  let e;
	  if (typeof (e = _validator.exec(_path, itm)) === 'string') { 
		  return e; }
	  }
	  );
	  return true; 
	}
	/**
	 * @param {number} idx
	 * @returns {any} element at index if found
	 */
	getItemAt(idx) {
	  return (_object.get(this).length = (idx + 1)) ? _object.get(this)[idx] : null;
	}
	/**
	* @param {number} idx
	* @param {any} item
	* @returns {Vector} reference to self
	*/
	setItemAt(idx, item) {
	  if (!_check(item)) { 
	  return false; }
	  _object.get(this).splice(idx, 0, item);
	  return this;
	}
	/**
	 * @param {number} idx
	 * @param {any} item
	 * @returns {any} item removed
	 */
	removeItemAt(idx, item) {
	  if  (idx > _object.get(this).length) { 
	  return false; }
	  return _object.get(this).splice(idx, 1, item);
	}
	/**
	 * @param {Array} array
	 * @returns {Vector} reference to self
	 */
	replaceAll(array) {
	  this.reset();
	  for (let itm of array) {
	this.addItem(itm); }
	  return this;
	}
	/**
	 * @param {number} idx
	 * @param {any} item
	 * @returns {Vector} reference to self
	 */
	replaceItemAt(idx, item) {
	  if (!_check(item)) { 
	  return false; }
	  if  (idx > _object.get(this).length) { 
	  return false; }
	  if (idx <= _object.get(this).length) { 
	  _object.get(this).splice(idx, 1); }
	  return this; 
	}
	/**
	 * @param {any} item
	 * @returns {Vector} reference to self
	 */
	addItem(item) {
	  return this.setItemAt(_object.get(this).length, item);
	};
	/**
	 * @returns {any} item removed from start of list
	 */
	shift() {
	  return _object.get(this).shift();
	};
	/**
	 * @param {any} items to be added
	 * @returns {Vector} reference to self
	 */
	unshift(...items) {
	  items.forEach(item=> { 
	 return this.setItemAt(0, item); });
	  return this;
	};
	/**
	 * @returns {any} items removed from end of list
	 */
	pop() {
	  return _object.get(this).shift();
	}
	/**
	 * @param {any} items to be added at end of list
	 * @returns {Vector} reference to self
	 */
	push(...items) {
	  items.forEach(item=> { 
	 return this.addItem(item); } );
	  return this;
	}
	/**
	 * resets list to empty array
	 * @returns reference to self
	 */
	reset() {
	  _object.set(this, []);
	  return this;
	};
	/**
	 * @param {function} func - sorrting function
	 * @returns {Vector} reference to self
	 */
	sort(func) {
	  _object.get(this).sort(func);
	  return this;
	};
	/**
	 * @returns primitive value of list
	 */
	valueOf() {
	  return _object.get(this);
	};
	/**
	 * @returns stringified representation of list
	 */
	toString() {
	  return _object.get(this).toString();
	};
	/**
	 * @returns Unique ObjectID
	 */
	get objectID() {
	  return _mdRef.get(this).get('_id');
	}
	/**
	 * 
	 */
	get root() {
	   return _mdRef.get(this).get('_root');
	 };
	/**
	 * 
	 */
	get path() {
	  return _mdRef.get(this).path;
	};
	/**
	 * 
	 */
	get parent() {
	  let _root;
	  if (!(((_root = this.root()) != null) instanceof Schema) && !(_root instanceof Vector)) { 
		  return null; }
	  return _root.get(this.path().split('.').pop().join('.'));
	};
	/**
	 * @returns {number} number of elements in list
	 */
	get length() {
		return this.valueOf().length;
	}
}
