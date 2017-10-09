/////////////////////////////////////////////////
// JSD
// (c)2015-2016 Van Carney <carney.van@gmail.com>
/////////////////////////////////////////////////
// references the global scope of our environment
const _global = (typeof exports !== "undefined") && (exports !== null) ? exports : window;
/**
 * @private
 */
_global.JSD = ()=> {
  "use strict";
  const _object				= new WeakMap();
  const _mdRef				= new WeakMap();
  const _kinds              = new WeakMap();
  const _required_elements	= new WeakMap();
  const _validators			= new WeakMap();
  const _singletons			= new WeakMap();
  const _vectorTypes		= new WeakMap();
  const _schemaOptions		= new WeakMap();
  const _schemaHelpers		= new WeakMap();
  const _schemaSignatures	= new WeakMap();
  // injects base classes
  //-- inject:./classes/_schemaValidator.js
  //-- inject:./classes/_validators.js
  //-- inject:./classes/_validatorBuilder.js
  //-- inject:./classes/set.js
  //-- inject:./classes/_schemaHelpers.js
  //-- inject:./classes/schema.js
  //-- inject:./classes/_metaData.js
  let _jsd_ = new JSD();
  _jsd_.registerClass("Schema", Schema);
  _jsd_.registerClass("Set", Set);
  let _sKeys = Object.keys(_jsd_.schemaRef);
  if (_jsd_.rx === null) { 
	  _jsd_.rx = new RegExp( `^((${_sKeys.join("|")})+,?){${_sKeys.length}}$` ); }
  return _jsd_;
};
//polyfills Object.assign
if (typeof Object.assign != "function") {
  Object.assign = function(target) {
    if (target == null) { 
    	throw new TypeError("Cannot convert undefined or null to object"); }
    target = Object(target);
    let index  = 1;
    while (index < arguments.length) {
      let source = arguments[index];
      if (source !== null) {
        for (let key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]; } } }
      index = index + 1; }
    return target; }
}
//-- inject:./wfUtils.js
let _exists = _global.wf.exists;
//== holds references to registered JS Objects
let _kinds = new WeakMap() || {};
//injects JSD Class
//-- inject:./classes/jsd.js
//injects NPM Modules
//-- inject:../include/index.js
