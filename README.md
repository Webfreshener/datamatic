Model
=============
**Reactive Validating Object**<br/>
RxJS + JSON-Schema (Ajv) Based Observable Data Models

[![Build Status](https://travis-ci.org/Webfreshener/RxVO.svg?branch=master)](https://travis-ci.org/Webfreshener/RxVO)
[![Dependency Status](https://david-dm.org/webfreshener/RxVO/status.svg)](https://david-dm.org/webfreshener/RxVO)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c665c70dfeb144319bc5bbd58695eb90)](https://www.codacy.com/app/vanschroeder/RxVO?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Webfreshener/RxVO&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/c665c70dfeb144319bc5bbd58695eb90)](https://www.codacy.com/app/vanschroeder/RxVO?utm_source=github.com&utm_medium=referral&utm_content=Webfreshener/RxVO&utm_campaign=Badge_Coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/625326e1880421ccc809/maintainability)](https://codeclimate.com/github/Webfreshener/RxVO/maintainability)

[Online Developer Documentation](https://webfreshener.github.io/RxVO/)

### Goals 
 * Provide a means to quickly and easily validate complex data-sets
 * Look and feel like a standard JS Object for ease of use and adaptability
 * Automate creation of RxJS Update and Error notifications 

### Table of Contents

**[Installation Instructions](#installation-instructions)**

**[Usage Examples](#usage-examples)**
   * [Basic Usage](#basic-usage)
   * [Flow Control](#flow-control)

**[Developer Guide](#developer-guide)**
  * [Model Class](#rxvo-class)
    * [Schemas Config](#rxvo-schemas-config)
    * [Model Proxy Object](#model-proxy-object)
    * [model vs $model](#model-vs-model)
  * [ItemsModel](#itemsmodel)
  * [PropertiesModel](#propertiesmodel)
  * [Model Class](#model-class)
  * [Pipe Class](#pipe-class)

#### Installation Instructions
```
$ npm i rxvo
```

#### Usage Example 

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

// update the rxVO
// this will trigger the next notification
obj.model.topScores[0].score++;

// invalid attempt update the rxVO
// this will trigger the error notification
// reason: "topScores/items/score" is type is integer 
obj.model.topScores[0].score = "1234";

// invalid attempt update the rxVO
// this will trigger the error notification
// reason: "topScores" is marked as required
delete obj.model.topScores;

```
Refer to the examples demo in `./examples/basic-usage` for more usage examples

#### Flow Control ####
```

```

## Developer Guide

#### Model Class ####
This class represents the Document entry point

| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor   | [schemas config](#rxvo-schemas-config) (object), [options (object)] | creates new Model instance |
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
 const _rxvo = new Model({schemas: [schema]});
 
 // access the root model:
 console.log(`JSON.stringify(_rxvo.model)`);
 
 // access the model's owner Model Class:
 const owner = _rxvo.model.$model;
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
| pipe | ..pipesOrSchemas | returns TxPipe instance for operating on model |
| reset | | resets model to initial state if operation is valid |
| root [getter]   | | retrieves root Model instance |
| rxvo [getter]   | | retrieves Model's Model document instance |
| subscribe   |  observers (object) | Subscribes Observers to the Model Model Root |
| subscribeTo   |  path (string), observers (object) | Subscribes Observers to the Model at path |
| toString   | | retrieves root model as JSON String |
| toJSON   | | retrieves root model as JSON Object |
| validate   | path (string), value (object) | validates data at given ath against JSON-Schema |
| validationPath [getter] | | retrieves json-schema path string for Model validation |

#### TxPipe Class ####
| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor | vo, ...pipesOrSchemas | class constructor method |
| exec | data (object/array)| executes pipe's callback with data without writing to `pipe` |
| subscribe | handler (object / function)| subscribes to `pipe` output notifications |
| toJSON | | Provides current state of `pipe` output as JSON |
| toString | | Provides current state of `pipe` output as JSON string |
| txClone | | returns clone of current `pipe` segment |
| txClose | | terminates input on `pipe` segment |
| txWritable [getter] | | Returns write status of `pipe` |
| txLink | target (Pipe), ...pipesOrSchemas | links `pipe` segment to direct output to target `pipe` |
| txMerge | pipeOrPipes, schema | merges multiple pipes into single output |
| txOnce | | informs `pipe` to close after first notification |
| txPipe | ...pipesOrSchemas | returns new chained `pipe` segment |
| txSample | nth | Returns product of Nth occurrence of `pipe` execution |
| txSplit | ...pipesOrSchemas | creates array of new `pipe` segments that run in parallel |
| txTap | | Provides current state of `pipe` output. alias for `toJSON` |
| txThrottle | rate (number) | Limit notifications to rate based on time interval |
| txUnlink | target (Pipe)| unlinks `pipe` segment from target `pipe` |
| txWrite | data (object/array)| writes data to `pipe` |

