fun-utils
=========

[![Build Status](https://travis-ci.org/vancarney/fun-utils.png)](https://travis-ci.org/vancarney/fun-utils)
[![NPM Version](http://img.shields.io/npm/v/fun-utils.svg)](https://www.npmjs.org/package/fun-utils)

Small collection of Function utility methods


Methods
-----------

#### getFunctionName(function)
Attempts to safely determine name of a named function
returns `string` or `null` if undefined

*example:*
```
var f = function testing() {};
console.log( Fun.getFunctionName(f) );
```

#### getConstructorName(function)
Attempts to safely determine name of the Class Constructor
returns `string` or `null` if undefined

*example:*
```
var d = new Date('05/Nov/1605');
console.log( Fun.getConstructorName(d) );
```

#### construct(constructor, args)
Invokes a Constructor with optional arguments array

*example:*
```
console.log( Fun.construct( Date, '5/Nov/1605' ).toString() );
```

#### factory(args)
Returns an arbitrary Function from array

*example:*
```
console.log( Fun.factory( ['a,b', 'return a + b'] )(2,2) );
```

#### fromString(string)
Creates function from string (simple functions only -- does not support nesting)

*example:*
```
str = 'function (a, b) { return a+b; }';
console.log( Fun.fromString( str )(2,2) );
```

#### toString(function)
Converts function to string, using encoding to handle native objects (simple functions only -- does not support nesting)

*example:*
```
var f = function (a,b) { return a + b; };
console.log( Fun.toString( f ) );
```