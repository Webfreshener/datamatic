strictly-hash
=============

A strict Hash implementation allowing key restriction and virtualization

[![Build Status](https://travis-ci.org/vancarney/sparse.png)](https://travis-ci.org/vancarney/strictly-hash)
[![NPM Version](http://img.shields.io/npm/v/strictly-hash.svg)](https://www.npmjs.org/package/strictly-hash)

Installation
-----------

npm:
```
npm install strictly-hash
```

bower
```
bower install strictly-hash
```

Usage
-----------


*coffeescript* example:

```
inst = new Hash (
  param_one:"foo"
  param_two:"bar"
), ['param_one', 'param_two']

inst.set 'param_three', 'baz'
# param_three isn't allowed - prints 'undefined'
console.log inst.get 'param_three'
# prints 'foobar'
console.log "#{inst.get 'param_one'}#{inst.get 'param_two'}"
```

*javascript* example:

```
var inst = new Hash({
  param_one:'foo',
  param_two:'bar'
}, ['param_one', 'param_two']);

inst.set( 'param_three', 'baz' );
// param_three isn\'t allowed - prints \"undefined\"
console.log( inst.get( 'param_three' ) );
// prints \"foobar\"
console.log( ""+inst.get( 'param_one')+inst.get( 'param_two' ) );
``` 



*coffeescript* example:

```
class Instance extends Hash
  constructor:->
  	Instance.__super__.constructor.call @, (
  	  param_one:"foo"
  	  param_two:"bar"
  	), ['param_one', 'param_two']
inst = new Instance
inst.set 'param_three', 'baz'
# param_three isn't allowed - prints 'undefined'
console.log inst.get 'param_three'
# prints 'foobar'
console.log "#{inst.get 'param_one'}#{inst.get 'param_two'}"
``` 


*javascript* example:

```
(function() {
  var Instance, Hash,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Instance = (function(_super) {
    __extends(Instance, _super);
    
    function Instance() {
      return Instance.__super__.constructor.apply(this, {
	  	  param_one:"foo",
	  	  param_two:"bar"
      }, ['param_one', 'param_two']);
    }

  })(Hash);

}).call(this);
```

Constructor
-----------


### Hash([object, restricted_keys])

Creates new hash instance

#### Arguments

Object **object**: (optional) Sets initial contents of Hash

Array **restricted_keys**: (optional) If present, restricts the hash keys to the provided values



Methods
-----------

#### get(key)
gets key/value from virtualized object

#### set(key, value)
sets key/value to virtualized object

#### has(key)
tests for key existance

#### del(key)
removes key from hash

#### forEach(iterator, scope)
traverses hash, calling iterator on each node

#### keys()
returns object keys

#### valueOf()
returns object

#### toJSON()
returns object

#### toString(pretty)
returns returns string representation of hash, if pretty is `true` will format the string for readability

#### canFreeze()
returns true if environment supports Object.freeze

#### freeze()
freezes Hash object if feature supported by environment

#### isFrozen()
returns true if Hash is frozen

#### canSeal()
returns true if environment supports Object.seal

#### seal()
seals Hash object if feature supported by environment

#### isSealed()
returns true if Hash is sealed

#### canPreventExtensions()
returns true if environment supports Object.canPreventExtensions

#### isExtensible()
returns false if Hash is not Extensible

#### preventExtensions()
prevent Extensability for Hash object if feature supported by environment