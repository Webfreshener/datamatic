JSD
=============
**JSON Schema Definition**<br/>
Schema Based Self-Validating and Observable Data Models

[![Build Status](https://travis-ci.org/Webfreshener/JSD.svg?branch=master)](https://travis-ci.org/Webfreshener/JSD)
[![Dev Dependency Status](https://david-dm.org/webfreshener/jsd/dev-status.svg)](https://david-dm.org/webfreshener/jsd?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3ca79cd83489410295680ef3ee96cd01)](https://www.codacy.com/app/vanschroeder/JSD?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Webfreshener/JSD&amp;utm_campaign=Badge_Grade)

[Online Developer Documentation](https://webfreshener.github.io/JSD/)

### Purpose 
 Most every developer has wished for a way to quickly and easily validate data from User Input or remote API calls and
 and to be able to easily recieve update notifications without having to manually write code to facilitaate those 
 objectives it is to that end that JSD was developed, an Observable, Schema Based Data Validation Utility written for Javascript, 
 but which sets forth a Specification which may be implemented in any

### Table of Contents

**[Installation Instructions](#installation-instructions)**

**[Basic Usage](#basic-usage)**

   * [Schema Basics](#schema-basics)
    
**[JSD Specification](#jsd-specification)**

   * [Array Type](#array-type)
   * [Boolean Type](#boolean-type)
   * [Number Type](#number-type)
   * [Object Type](#object-type)
   * [String Type](#string-type)
   
**[Advanced Usage](#advanced-usage)**

   * [Wildcard Keys](#wildcard-keys)
   * [Wildcard Types](#wildcard-types)
   * [Polymorphism](#polymorphism)
   * [Regular Expressions](#regular-expressions)
    
        * [JSON File Example with Special Escaping](#json-file-example-with-special-escaping)

#### Installation Instructions ####
There are no dependencies or prerequesites besides NPM and NodeJS
However, this project is not yet published. 
You must manually add to your package.json
```
...
dependencies: {
    ...
    "jsd": "git+https://github.com/Webfreshener/JSD",
    ...
}
...
```

#### Basic Usage ####

##### Schema Basics #####

A schema is simply a JSON Document that 
describes the attributes of a Data Model

The example below defines an Schema that expects a `name` and an `age` attribute

```
let _schema = {
    "name": {
        "type": "String",
        "required": true
    },
    "age": {
        "type": "Number",
        "required": true
    }
};

const _handlers = {
    next: function (schema) {
        if (typeof schema !== 'undefined') {
            // outputs: {"name":"Frank","age":23}
            console.log(`${schema}`); 
        }
    },
    error: function (e) {
        // outputs: error: 'age' expected number, type was '<string>'
        console.log(`error: ${e}`);
    }
};

const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handlers);

// set invalid data to the model to trigger error handler
_jsd.document.model = {
    "name": "Frank",
    "age": "23"
};

// set valid data to the model to trigger next handler
_jsd.document.model = {
    "name": "Frank",
    "age": 23
};
```


### JSD Specification ###


#### Array Type 
Attribute Name | Data Type
---------------|-----------
required | Boolean
elements | Object
default | Array 

###### Schema Example
```
// defines an Array of Strings
{
    type: "Array",
    "required": false,
    "elements": {
        "type": "String",
        "required": false
    }
}

// defines an Array of Strings and Numbers
{
    type: "Array",
    "required": false,
    "elements": [
        {
        "type": "String",
        "required": false
       },
       {
        "type": "String",
        "required": false
        }
     ]
}
```
###### Usage Example
```
const _schema = {
    values: {
        type: "Array",
        elements: [{
            type: "Object",
            elements: {
                name: {
                    type: "String",
                    required: true,
                    restrict: "^[a-zA-Z0\\-\\s]{1,24}$"
                },
                score: {
                    type: "Number",
                    required: true
                },
            }
        }]
    }
};

let _handler = {
    next: (val) => {
        // outputs: {"values":[{"name":"Player 1","score":2000000},...]}
        console.log(`${val}`);
        _jsd.document.unsubscribe();
    },
    error: (e) => {
        console.log(`error: ${e}`);
    }
};

const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);
_jsd.document.model = {
    values: [{
        name: "Player 1",
        score: 2000000
    }, {
        name: "Player 2",
        score: 1100000
    }, {
        name: "Player 3",
        score: 900000
    }]
};
```

#### Boolean Type
Attribute Name | Data Type
---------------|-----------
required | Boolean
default | Boolean 
```
// defines an Boolean Element 
{
    "myElement": {
        "type": "Boolean",
        "required": false,
        "default": true
    }
}
```

###### Usage Example
```
const _schema = {
    value: {
        type: "Boolean",
        required: false,
    }
};

let _handler = {
    next: (val) => {
        // {"value":true}
        // {"value":false}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected boolean, type was '<string>'
        console.log(`error: ${e}`);
    }
};


const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);
_jsd.document.model = {value: "true"};
_jsd.document.model = {value: true};
_jsd.document.model = {value: false};
```

#### Number Type
Attribute Name | Data Type
---------------|-----------
required | Boolean
default | Number 

```
// defines an Number Element 
{
    "myElement": {
        "type": "Number",
        "required": false,
        "default": 0 
    }
}
```

###### Usage Example
```
const _schema = {
    value: {
        type: "Number",
        required: true,
        // default: true,
    }
};

let _handler = {
    next: (val) => {
        // {"value":1234}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected number, type was '<string>'
        console.log(`error: ${e}`);
    }
};


const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);
_jsd.document.model = {value: "1234"};
_jsd.document.model = {value: 1234};
```

#### Object Type 
Attribute Name | Data Type
---------------|-----------
required | Boolean
extensible | Boolean
elements | Object
polymorphic | Array
default | Object 

```
// defines an Object Element 
{
    "myElement": {
        "type": "Object",
        "required": false,
        "default": {
         },
         elements: {
            "name": {
                "type": "String"
                "required": true
            },
            "active": {
                "type": "Boolean"
                "required": false,
                "default": true
            }
         }
    }
}
```

###### Usage Example
```
const _schema = {
    value: {
        type: "Object",
        required: false,
        default: {},
        elements: {
            name: {
                type: "String",
                required: true
            },
            active: {
                type: "Boolean",
                required: false
            }
        }
    }
};

let _handler = {
    next: (val) => {
        // {"value":{"name":"Alice","active":true}}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value.active' expected boolean, type was '<number>'
        console.log(`error: ${e}`);
    }
};

const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);
// this will error since `active` is a number
_jsd.document.model = {
    value: {
        name: "Alice",
        active: 1,
    }
};

// this will pass
_jsd.document.model = {
    value: {
        name: "Alice",
        active: true
    }
};
```

#### String Type 
Attribute Name | Data Type
---------------|-----------
required | Boolean
restrict | RegExp
default | String

``` 
// defines a String Element 
{
    "myElement": {
        "type": "String"
        "required": true
    }
}
```

###### Usage Example
```
const _schema = {
    value: {
        type: "String",
        required: true,
        restrict: "^[a-zA-Z0-9_\\s\\-]+$"
    }
};

let _handler = {
    next: (val) => {
        // {"value":"false"}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected string, type was '<boolean>'
        console.log(`error: ${e}`);
    }
};


const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);
_jsd.document.model = {value: true};
_jsd.document.model = {value: "false"};
```

### Advanced Usage 

#### Wildcard Keys
Wildcards keys allow for cases where you might not know or care about the actual key values.
This is useful in cases where you might have severage elements of the ame data type and 
format that you wish to describe in a single instance

###### Schema Example
```
// declares any amount of Alphanumeric String values
{
    "*": {
        "type": "String",
        "restrict": "^[a-zA-Z0-9\-]{1,10}$"
    }
}

// declares any amount of extensible Object values with name and age attributes 
{
    "*": {
        type: "Object",
        "extensible": true
        "elements": {
            "name": {
                "type": "String",
                "required": true,
                "restrict": "^[a-zA-Z0-9\-]{1,10}$"
            },
            {
            "age": {
                "type": "Number",
                "required":true 
            }
        },
    }
}
```
###### Usage Example
```
const _schema = {
                    "*": {
                        type: "Object",
                        "extensible": true
                        "elements": {
                            "name": {
                                "type": "String",
                                "required": true,
                                "restrict": "^[a-zA-Z0-9_\s\-]{9,}$"
                            },
                            {
                            "score": {
                                "type": "Number",
                                "required":true 
                            }
                        },
                    }
                };

let _handler = {
    next: (val)=> {
        console.log(val);
        _jsd.unsubscribe();
    }
};

const _jsd = new JSD(_schema);
_jsd.subscribe(_handler);
_jsd.document.model = {
    1: {
        name: "Big Daddy",
        score: 2000000
       },
    2: {
        name: "HeavyMetalPrincess",
        score: 1100000
        },
    3: {
        name: "Munga-Munga",
        score: 900000
    }
};
```
#### Wildcard Types 
In some cases, you might know the key of an attribute, 
but the type might not be determined. In these cases,
where you want to restrict an object to known keys but 
allow for various value assignment, you can use 
wildcard types

###### Schema Example
```
// declares element myKey which can be any type, but must be present 
{
    "myKey": {
        "type": "*",
        "required": true
    }
}

// declares an Object that allows for special user data 
{
    "id": {
        "type": "Number",
        "required": true,
    },
    "name": {
        "type": "String",
        "required": true,
        "restrict": "^[a-zA-Z0-9\-]{1,10}$"
    },
    {
    "dataField1": {
        "type": "*",
        "required": false 
    },
    "dataField2": {
        "type": "*",
        "required": false 
    }
}
```
###### Usage Example
```
const _schema = {
    value: {
        type: "*",
    }
};

let _handler = {
    next: (val) => {
        // {"value":900000}
        // {"value":"A string"}
        // {"value":false}
        console.log(`${val}`);
        _jsd.document.unsubscribe();
        done()
    }
};

const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

_jsd.document.model = {
    value: 900000,
};
_jsd.document.model = {
    value: "A string",
};
_jsd.document.model = {
    value: false,
};
```

#### Polymorphism
In cases where you want to keep the data model tightly defined but must allow for certain values to conform to more 
than one data type, you can use polymorhism

###### Schema Example
```
// declares element `polyValue` which can be a String or an Object
{
   "polyValue": {
     "required": true,
     "polymorphic": [
       {
         "type": "String",
         "restrict": "^[a-zA-Z-0-9_]+$"
       },
       {
         "type": "Object",
         "elements": {
           "name": {
             "type": "String",
             "required": true,
             "restrict": "^[a-zA-Z-0-9_]{1,24}+$"
           },
           "details": {
             "type": "String",
             "required": false,
             "restrict": "^[a-zA-Z-0-9_]{0,256}+$"
           }, 
         }
       }
     ]
   } 
}
```
###### Usage Example
```
const _schema = {
    polyValue: {
        required: true,
        polymorphic: [{
            type: "String",
            restrict: "^[a-zA-Z0-9_\\s]+$"

        },
        {
            type: "Object",
            "*": {
                type: "Number"
            },
        }]
    }
};

let _cnt = 0;
let _handler = {
    next: (val) => {
        // {"polyValue":"HeavyMetalPrincess"}
        // {"polyValue":{"name":"HeavyMetalPrincess","description":"cupcakes"}}
        // {"polyValue":{"HeaveyMetalPrincess":10001234}}
        console.log(`${val}`); 
    }
};

const _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// can be a string value
_jsd.document.model = {
    "polyValue": "HeavyMetalPrincess",
}

_jsd.document.model = {
    "polyValue": {
        "name": "HeavyMetalPrincess",
        "description": "cupcakes",
    }
};

_jsd.document.model = {
    "polyValue": {
        HeaveyMetalPrincess: 10001234
    },
};
```

#### Regular Expressions
JSD allows the use of Regular Expressions to restrict String input
There are caveats to it's use due to the nature of RegExp syntax vs  JSON
character encoding limitations

###### JS and TS file Example
```
// in code declaring a RegExp in JS or TS is no big deal 
const schema = {
   stringValue: {
     required: true,
     type: "String",
     restrict: "^[a-zA-Z0-9_\\-\\s]+$"
   }
};
```


###### JSON File Example with Special Escaping
```
{
    "stringValue": {
        "required": true,
        "type": "String",
        "restrict": "^[a-zA-Z0-9_\\\\-\\\\s]+$"
    }
}
```