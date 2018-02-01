JSD
=============
**JSON Schema Definition**<br/>
Schema Based Self-Validating and Observable Data Models

[![Build Status](https://travis-ci.org/Webfreshener/JSD.svg?branch=master)](https://travis-ci.org/Webfreshener/JSD)
[![Dev Dependency Status](https://david-dm.org/webfreshener/jsd/dev-status.svg)](https://david-dm.org/webfreshener/jsd?type=dev)

[Online Developer Documentation](https://webfreshener.github.io/JSD/)

### Purpose 
 Most every developer has wished for a way to quickly and easily validate data from User Input or remote API calls and
 and to be able to easily recieve update notifications without having to manually write code to facilitaate those 
 objectives it is to that end that JSD was developed, an Observable, Schema Based Data Validation Utility written for Javascript, 
 but which sets forth a Specification which may be implemented in any

### Table of Contents

**[Installation Instructions](#installation-instructions)**

**[Basic Usage](#basic-usage)**

**[JSD Specification](#jsd-specification)**

   * [Array Type](#array-type)
   * [Boolean Type](#boolean-type)
   * [Number Type](#number-type)
   * [Object Type](#object-type)
   * [String Type](#string-type)
   

#### Installation Instructions ####
There are no dependencies or prerequesites besides NPM and NodeJS

```
$ npm i --save @jsd/core
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
    "age" {
        "type": "Number",
        "required": true
    }
};
const _handlers = {
    next: function(model) {
        console.log(`${_jsd.document}`); // prints: {"name": "Frank", "age": 23}
    },
    error: function(e) {
        console.log(e);
    }
}
const _jsd = new JSD(_schema);
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
default | Array 

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

### Advanced Usage 

#### Wildcards

#### Polymorphism

#### Regular Expressions