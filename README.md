Datamatic
=============
RxJS + JSON-Schema (Ajv) Based Observable and Validating Data Models and Pipelines

[![Build Status](https://travis-ci.org/Webfreshener/datamatic.svg?branch=master)](https://travis-ci.org/Webfreshener/datamatic)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/49624d8edeec44e9af6fc484f8b414af)](https://www.codacy.com/gh/Webfreshener/datamatic/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Webfreshener/datamatic&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/49624d8edeec44e9af6fc484f8b414af)](https://www.codacy.com/gh/Webfreshener/datamatic/dashboard?utm_source=github.com&utm_medium=referral&utm_content=Webfreshener/datamatic&utm_campaign=Badge_Coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/f0bfbe06d67c3c489f4d/maintainability)](https://codeclimate.com/github/Webfreshener/datamatic/maintainability)

[Online Developer Documentation](https://webfreshener.github.io/datamatic/)

### Goals 
 * Provide a means to quickly and easily validate complex data-sets
 * Look and feel like a standard JS Object for ease of use and adaptability
 * Automate data evaluation and transformation

### Table of Contents

**[Installation Instructions](#installation-instructions)**

**[Usage Examples](#usage-examples)**
   * [Basic Example](#basic-example)
   * [Data Pipelines and Transformation](#data-pipelines-and-transformation)

**[Developer Guide](#developer-guide)**
  * [Model Class](#model-class)
    * [Model Schemas Config](#model-schemas-config)
    * [Model Proxy Object](#model-proxy-object)
    * [model vs $model](#model-vs-&dollar;model)
  * [ItemsModel](#itemsmodel)
  * [PropertiesModel](#propertiesmodel)
  * [BaseModel Class](#basemodel-class)
  * [Pipeline Class](#pipeline-class)

### Installation Instructions
```
$ npm install @webfreshener/datamatic
```

#### UMD Usage for React and Angular
```
import * as datamatic from "datamatic";

```

#### CommonJS Usage for NodeJS
```
const {Model, Pipeline} = require("datamatic");

```

#### DOM Window Usage
```
    <script src="../../dist/datamatic.window.js"></script>
    <script language="JavaScript">
        const {Model, Pipeline} = window.datamatic;
    </script>
```



### Usage Examples

#### Basic Example
The example below defines a Model that expects a `name` value and 
list of `topScores` items

```
const {Model} = require("datamatic");

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
const {Pipeline} = require("datamatic");

/*
    defines a schema that requires name, age and active attributes
    filters out all items that do not conform to JSON-Schema below
 */
const schema = {
    type: "object",
    required: ["name", "age", "active"],
    properties: {
        name: {
            $comment: "names must be in form: First Middle|MI Last",
            type: "string",
            pattern: "^[a-zA-Z]{1,24}\\s?[a-zA-Z]?\\s+[a-zA-Z]{1,24}$",
        },
        age: {
            $comment: "age must be a number equal to or higher than 21 and lower than 100",
            type: "number",
            minimum: 21,
            maximum: 100,
        },
        active: {
            $comment: "active must equal true",
            type: "boolean",
            const: true,
        },
    },
};


const pipeline = new Pipeline(
    [
        // By nesting an item schema within an iterator, the schema is applied as a filter
        schema,
        // the list can go on ...
    ],
    // the list can go on ...
);

pipeline.subscribe({
    // should only contain active people who are 21 and over and name pattern match
    next: (d) => console.log(`\nfiltered results:\n${JSON.stringify(d)}`),
    // it should not encounter an error unless it is critical, so full stop
    error: (e) => console.error(`\ngot error:\n${JSON.stringify(e)}`),
});

pipeline.write([
    {name: "Alice Dodson", age: 30, active: false}, // will be filtered because of active status
    {name: "Jim-Bob", age: 21, active: true}, // will be filtered because of name format
    {name: "Bob Roberts", age: 38, active: true}, // will pass
    {name: "Chris Appleton", age: 19, active: true}, // will be filtered because of age
    {name: "Fred Franks", age: 20, active: true}, // will be filtered because of age
    {name: "Sam Smith", age: 25, active: true}, // will pass
    {name: "", active: null}, // will be filtered because of invalid object format
]);
```

## Developer Guide

#### Model Class ####
This class represents the Document entry point

| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor   | [schemas config](#model-schemas-config) (object), [options (object)] | creates new Model instance |
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


#### BaseModel Class ####
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
| pipeline | ...(pipes &#124; schemas) | returns Pipeline instance for operating on model |
| reset | | resets model to initial state if operation is valid |
| root [getter]   | | retrieves root Model instance |
| model [getter]   | | retrieves Model's internal Model Document instance |
| subscribe   |  observers (object) | Subscribes Observers to the Model Model Root |
| subscribeTo   |  path (string), observers (object) | Subscribes Observers to the Model at path |
| toString   | | retrieves root model as JSON String |
| toJSON   | | retrieves root model as JSON Object |
| validate   | path (string), value (object) | validates data at given ath against JSON-Schema |
| validationPath [getter] | | retrieves json-schema path string for Model validation |

#### Pipeline Class ####
| Method        | Arguments | Description  |
|:--------------|:----------|:-------|
| constructor | ...pipesOrSchemas | class constructor method |
| exec | data (object &#124; array &#124; string &#124; number &#124; boolean)| executes pipeline's callback with data without writing to `pipeline` |
| subscribe | handler (object &#124; function &#124; schema &#124; array)| subscribes to `pipeline` output notifications |
| toJSON | | Provides current state of `pipeline` output as JSON |
| toString | | Provides current state of `pipeline` output as JSON string |
| clone | | returns clone of current `pipeline` segment |
| close | | terminates input on `pipeline` segment |
| writable [getter] | | Returns write status of `pipeline` |
| link | target (Pipeline), ...pipesOrSchemas | links `pipeline` segment to direct output to target `pipeline` |
| merge | ...(pipes &#124; schemas) | merges multiple pipes into single output |
| once | | informs `pipeline` to close after first notification |
| pipeline | ...(pipes &#124; schemas) | returns new chained `pipeline` segment |
| sample | nth | Returns product of Nth occurrence of `pipeline` execution |
| split | ...(pipes &#124; schemas) | creates array of new `pipeline` segments that run in parallel |
| tap | | Provides current state of `pipeline` output. alias for `toJSON` |
| throttle | rate (number) | Limit notifications to rate based on time interval |
| unlink | target (Pipeline)| unlinks `pipeline` segment from target `pipeline` |
| write | data (object &#124; array &#124; string &#124; number &#124; boolean)| writes data to `pipeline` |

