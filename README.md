Datamat
=============
RxJS + JSON-Schema (Ajv) Based Observable and Validating Data Models and Pipelines

[![Build Status](https://travis-ci.com/Webfreshener/datamat.svg?branch=master)](https://travis-ci.com/Webfreshener/datamat)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/49624d8edeec44e9af6fc484f8b414af)](https://www.codacy.com/gh/Webfreshener/datamat/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Webfreshener/datamat&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/49624d8edeec44e9af6fc484f8b414af)](https://www.codacy.com/gh/Webfreshener/datamat/dashboard?utm_source=github.com&utm_medium=referral&utm_content=Webfreshener/datamat&utm_campaign=Badge_Coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a578a2291adea1b5045b/maintainability)](https://codeclimate.com/github/Webfreshener/datamat/maintainability)

[Online Developer Documentation](https://webfreshener.github.io/datamat/)

### Goals 
 * Provide a means to quickly and easily validate complex data-sets
 * Look and feel like a standard JS Object for ease of use and adaptability
 * Automate data evaluation and transformation

### Table of Contents

**[Installation Instructions](#installation-instructions)**

**[Usage Examples](#usage-examples)**
   * [Basic Usage](#basic-usage)
   * [Data Pipelines and Transformation](#data-pipelines-and-tansformation)

**[Developer Guide](#developer-guide)**
  * [Model Class](#owner-class)
    * [Schemas Config](#owner-schemas-config)
    * [Model Proxy Object](#model-proxy-object)
    * [model vs $model](#model-vs-model)
  * [ItemsModel](#itemsmodel)
  * [PropertiesModel](#propertiesmodel)
  * [Model Class](#model-class)
  * [Pipeline Class](#pipeline-class)

#### Installation Instructions
```
$ npm install @webfreshener/datamat
```

### Usage Examples

#### Basic Example
The example below defines a Model that expects a `name` value and 
list of `topScores` items

```
// JSON-SCHEMA for Scores Collection
const schema = {
    "id": "root#",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
        },
        "topScores": {
            "type": "array",
            "minItems": 1,
            "maxItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "score": {
                        "type": "integer",
                        "default": 0
                    }
                },
                "required": ["name"]
            }
        }
    },
    required: ["name", "topScores"],
};


// instantiate our Model
const obj = new Model({schemas: [schema]});

// subscribes an observer to the Model
obj.subscribe({
    next: function (ref) {
        console.log("\t>> update succeeded!\n\t%s\n\t%s\n\n",
            "current object state:", "" + JSON.stringify(ref));
    },
    complete: function (ref) {
        console.log("\t>> %s",
            "object is frozen and no longer editable");
    },
    error: function (e) {
        console.log("\t>> update FAILED with error:\n\t%s\n",
            JSON.stringify(e));
        console.log("\tcurrent object state:\n\t%s\n", obj);
    },
});

// populate the Model with data
// -- this will trigger the "next" notification
obj.model = {
    name: "JSONville",
    topScores: [{
        name: "Player 1",
        score: 12300000,
    }, {
        name: "Player 2",
        score: 45600000,
    }, {
        name: "Player 3",
        score: 78900000,
    }]
};

// update the model
// this will trigger the next notification
obj.model.topScores[0].score++;

// invalid attempt update the model
// this will trigger the error notification
// reason: "topScores/items/score" is type is integer 
obj.model.topScores[0].score = "1234";

// invalid attempt update the model
// this will trigger the error notification
// reason: "topScores" is marked as required
delete obj.model.topScores;

```
Refer to the examples demo in `./examples/basic-usage` for more usage examples

#### Data Pipelines and Transformation ####
```

```

## Developer Guide

#### Model Class ####
This class represents the Document entry point

| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor   | [schemas config](#owner-schemas-config) (object), [options (object)] | creates new Model instance |
| errors [getter]   | | retrieves errors (if any) from last json-schema validation |
| model [getter/setter]   | | retrieves root [model proxy object](#model-proxy-object) for operation |
| getModelsInPath   | to (string) | retrieves models at given path |
| getSchemaForKey   | key (string) | retrieves json-schema with given key as ID |
| getSchemaForPath   | path (string) | retrieves json-schema for model at given path |
| schema [getter]   | | retrieves json-schema for root model |
| subscribe   |  observers (object) | Subscribes Observers to the Model Model Root |
| subscribeTo   |  path (string), observers (object) | Subscribes Observers to the Model at path 
| toString   | | retrieves root model as JSON String |
| toJSON   | | retrieves root model as JSON Object |
| validate   | path (string), value (object) | validates data at given ath against JSON-Schema |
| *static* fromJSON   | json (string &#124; object) | creates new Model from static method |

##### Model Schemas Config
| Property        | Type | Description  |
|:--------------|:----------|:-------|
| meta | array | Array of MetaSchema references to validate Schemas against
| schemas | array | Array of Schema references to validate data against 
| use | string | key/id of schema to use for data validation

##### Model Proxy Object 

This is the Data Model most usage will be based around.
It is a Proxy Object that has traps for all operations that alter the state of the given Array or Object

| Property        | Type | Description  |
|:--------------|:----------|:-------|
| $model | (PropertiesModel &#124; ItemsModel) | references Proxy Object owner class

##### model vs $model 

In usage, `model` always references the Proxied Data Model for validation and operation where `$model` references the owner Model Class

*example:*
```
 const _owner = new Model({schemas: [schema]});
 
 // access the root model:
 console.log(`JSON.stringify(_owner.model)`);
 
 // access the model's owner Model Class:
 const owner = _owner.model.$model;
 console.log(`is frozen: ${owner.isFrozen}`);
 
 // call toString on Owner
 console.log(`stringified: ${owner}`);
 
 // obtain model from  it's Owner
  console.log(`stringified: ${JSON.stringify(owner.model)}`);
 
```

#### ItemsModel ####
###### subclass of [Model Class](#model-class)

Represents an Items (Array) entry in the given schema
Note: the `model` param presents a Proxied Array, with all `Array.prototype` methods trapped and validatable

| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| model [getter/setter]   | | setter/getter for [model proxy object](#model-proxy-object) for operation |

#### PropertiesModel ####
###### subclass of [Model Class](#model-class)

Represents an Properties (Object} entry in the given schema

| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| get | key (string) | applies Object.freeze to model hierarchy |
| model [getter/setter]   | | setter/getter for [model proxy object](#model-proxy-object) for operation |
| set | key (string), value (any) | applies Object.freeze to model hierarchy |


#### Model Class ####
| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| freeze | | applies Object.freeze to model hierarchy |
| isDirty [getter]   | | returns dirtyness of model heirarchy (is dirty if operation in progress) |
| isFrozen [getter]   | | returns Object.freeze status of Model hierarchy |
| jsonPath [getter]   | | retrieves json path string for Model instance. eg: "this.is.my.path" |
| objectID [getter]   | | retrieves Unique ObjectID of Model instance |
| options [getter]   | | retrieves options passed to Model instance |
| path [getter]   | | retrieves json-schema path string for Model instance. eg: "#/this/is/my/path" |
| parent [getter]   | | retrieves Model's parent Model instance |
| pipe | ..pipesOrSchemas | returns Pipe instance for operating on model |
| reset | | resets model to initial state if operation is valid |
| root [getter]   | | retrieves root Model instance |
| model [getter]   | | retrieves Model's internal Model Document instance |
| subscribe   |  observers (object) | Subscribes Observers to the Model Model Root |
| subscribeTo   |  path (string), observers (object) | Subscribes Observers to the Model at path |
| toString   | | retrieves root model as JSON String |
| toJSON   | | retrieves root model as JSON Object |
| validate   | path (string), value (object) | validates data at given ath against JSON-Schema |
| validationPath [getter] | | retrieves json-schema path string for Model validation |

#### Pipe Class ####
| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor | ...pipesOrSchemas | class constructor method |
| exec | data (object / array / string / number / boolean)| executes pipe's callback with data without writing to `pipe` |
| subscribe | handler (object / function / schema / array)| subscribes to `pipe` output notifications |
| toJSON | | Provides current state of `pipe` output as JSON |
| toString | | Provides current state of `pipe` output as JSON string |
| clone | | returns clone of current `pipe` segment |
| close | | terminates input on `pipe` segment |
| writable [getter] | | Returns write status of `pipe` |
| link | target (Pipe), ...pipesOrSchemas | links `pipe` segment to direct output to target `pipe` |
| merge | pipeOrPipes, schema | merges multiple pipes into single output |
| once | | informs `pipe` to close after first notification |
| pipe | ...pipesOrSchemas | returns new chained `pipe` segment |
| sample | nth | Returns product of Nth occurrence of `pipe` execution |
| split | ...pipesOrSchemas | creates array of new `pipe` segments that run in parallel |
| tap | | Provides current state of `pipe` output. alias for `toJSON` |
| throttle | rate (number) | Limit notifications to rate based on time interval |
| unlink | target (Pipe)| unlinks `pipe` segment from target `pipe` |
| write | data (object / array / string / number / boolean)| writes data to `pipe` |

