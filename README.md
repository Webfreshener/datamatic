RxVO
=============
**Reactive Validating Object**<br/>
RxJS + JSON-Schema (Ajv) Based Observable Data Models

[![Build Status](https://travis-ci.org/Webfreshener/RxVO.svg?branch=master)](https://travis-ci.org/Webfreshener/RxVO)
[![Dev Dependency Status](https://david-dm.org/webfreshener/RxVO/dev-status.svg)](https://david-dm.org/webfreshener/RxVO?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c665c70dfeb144319bc5bbd58695eb90)](https://www.codacy.com/app/vanschroeder/RxVO?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Webfreshener/RxVO&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/625326e1880421ccc809/maintainability)](https://codeclimate.com/github/Webfreshener/RxVO/maintainability)

[Online Developer Documentation](https://webfreshener.github.io/RxJO/)


## &#9888; Caution!
This utility is not meant for general purpose use. It leverages several technologies such as RxJS, JSON-Schema and Proxy. As such it is not performant or suitable for applications that require a high degree of efficiency. However it should be fine for prototyping and single-user use in browsers or other sandboxed environments

### Purpose 
 RxVo was developed to provide a means quickly and easily validate data from User Input or remote API calls and
 and to be able to easily receive update notifications without having to manually write code to facilitate those 
 objectives. It is to that end that RxVO was developed, an Observable, Schema Based Data Validation Utility written 
 for Javascript 

### Table of Contents

**[Installation Instructions](#installation-instructions)**
    
**[RXVO Document](#jsd-specification)**

   * [Basic Usage](#basic-usage)
   * [API](#api)
   
        * [RxVO](#rxvo)
        * [Model](#model)
        * [PropertiesModel](#properties-model)
        * [ItemsModel](#items-model)

#### Install
```
$ npm i -s rxvo
```

#### Basic Usage ####

The example below defines a Model that expects a `name` value and 
list of `topScores` items

```
// JSON-SCHEMA for Scores Collection
const schema = {
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
const obj = new RxVO(schema);

// subscribes an observer to the Model
obj.subscribe({
    next: function (ref) {
        console.log("\t>> update succeeded!\n\t%s\n\t%s\n\n",
            "current object state:", "" + JSON.stringify(ref));
        doTask.next()
    },
    complete: function (ref) {
        console.log("\t>> %s",
            "object is frozen and no longer editable");
        doTask.next()
    },
    error: function (e) {
        console.log("\t>> update FAILED with error:\n\t%s\n",
            JSON.stringify(e));
        console.log("\tcurrent object state:\n\t%s\n", obj);
        doTask.next();
    },
});

// populate the RxVO with data
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


#### API ####


#### Model ####


#### PropertiesModel ####


#### ItemsModel ####