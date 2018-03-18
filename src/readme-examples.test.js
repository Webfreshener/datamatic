import {JSD} from "./index";
import {Set} from "./classes/set";
import {Schema} from "./classes/schema";
describe("README.md examples tests", () => {
    it("main Schema example should work", (done) => {
        const _schema = {
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
                if (typeof schema !== "undefined") {
                    // outputs: {"name":"Frank","age":23}
                    expect(schema.model.name).toBe("Frank");
                    expect(schema.model.age).toBe(23);
                    done();
                }
            },
            error: function (e) {
                // error: 'age' expected number, type was '<string>'
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
    });

    it("JSD Array example should work", (done) => {
        // we define an array that accepts objects comprised of a name string and numeric score
        const _schema = {
            type: "Array",
            default: [],
            elements: [{
                type: "Object",
                elements: {
                    name: {
                        type: "String",
                        required: true,
                        restrict: "^[a-zA-Z0-9\\-\\s]{1,24}$"
                    },
                    score: {
                        type: "Number",
                        required: true
                    },
                },
            }],
        };

        const _handler = {
            next: (val) => {
                // outputs: {"values":[{"name":"Player 1","score":2000000},{"name":"Player 2","score":1100000},{"name":"Player 3","score":900000}]}
                console.log(`done: ${val}`);
                // expect(val.model[0].("$ref")).toBe(true);
                expect(val.model[0].$ref instanceof Schema).toBe(true);
                done();
            },
            error: (e) => {
                // error: 'score' expected number, type was '<string>'s
                done(e);
            }
        };

        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        _jsd.document.model = [{
            name: "Player 1",
            score: 2000000,
        // }, {
        //     name: "Player 2",
        //     score: 1100000
        // }, {
        //     // this will error because score is a string value
        //     name: "BOGUS",
        //     score: "1100000"
        // }, {
        //     name: "Player 3",
        //     score: 900000
        }];
    });

    it("JSD Boolean example should work", (done) => {
        const _schema = {
            value: {
                type: "Boolean",
                required: false,
                default: true,
            }
        };

        const _handler = {
            next: (val) => {
                // outputs: {"value":true}
                // outputs: {"value":true}
                // outputs: {"value":false}
                console.log(`${val}`);
                done();
            },
            error: (e) => {
                // error: 'value' expected boolean, type was '<string>'
                console.log(`error: ${e}`);
            }
        };


        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        // - this will trigger the default value
        _jsd.document.model = {};

        // set value to true
        _jsd.document.model = {value: true};

        // set value to false
        _jsd.document.model = {value: false};

        // triggers error due to type mismatch
        _jsd.document.model = {value: "true"};
    });

    it("JSD Number example should work", (done) => {
        const _schema = {
            value: {
                type: "Number",
                required: true,
                // default: true,
            }
        };

        const _handler = {
            next: (val) => {
                // outputs: {"value":1234}
                console.log(`${val}`);
                done();
            },
            error: (e) => {
                // error: 'value' expected number, type was '<string>'
                console.log(`error: ${e}`);
            }
        };


        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        // this fails because the value is a string
        _jsd.document.model = {value: "1234"};

        // this will succeed
        _jsd.document.model = {value: 1234};
    });

    it("JSD String example should work", (done) => {
        const _schema = {
            value: {
                type: "String",
                required: true,
                restrict: "^[a-zA-Z0-9_\\s\\-]+$"
            }
        };

        const _handler = {
            next: (val) => {
                // outputs: {"value":"false"}
                console.log(`${val}`);
                done();
            },
            error: (e) => {
                // error: 'value' expected string, type was '<boolean>'
                console.log(`error: ${e}`);
            }
        };


        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        // this fails because type is boolean
        _jsd.document.model = {value: true};

        // this will succeeed
        _jsd.document.model = {value: "false"};
    });

    it("JSD Object example should work", (done) => {
        // we define an element named `value` that requires a name and optional active attributes
        const _schema = {
            value: {
                type: "Object",
                required: false,
                elements: {
                    name: {
                        type: "String",
                        required: true
                    },
                    active: {
                        type: "Boolean",
                        required: true,
                        default: false
                    }
                }
            }
        };

        const _handler = {
            next: (val) => {
                // outputs: {"value":{"name":"Alice","active":true}}
                // outputs: {"value":{"name":"Bob","active":false}}
                console.log(`${val}`);
                done();
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

        // this will also pass since `active` is optional
        _jsd.document.model = {
            value: {
                name: "Bob",
            }
        };
    });

    it("JSD Wildcard KEYS example should work", (done) => {
        // creates a schema that allows any key assignent, but value must be object
        const _schema = {
            "*": {
                type: "Object",
                extensible: true,
                elements: {
                    name: {
                        type: "String",
                        required: true,
                        restrict: "^[a-zA-Z0-9_\\s\\-]{9,}$"
                    },
                    score: {
                        type: "Number",
                        required: true,
                    }
                },
            }
        };

        const _handler = {
            next: (val) => {
                // {"1":{"name":"Big Daddy","score":2000000}, ...}
                console.log(`${val}`);
                _jsd.document.unsubscribe();
                done()
            },
            error: (e) => {
                // error: 1 expected value of type 'Object'. Type was '<number>'
                console.log(`error: ${e}`);
            }
        };

        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        // this will fail because value is number, not an object
        _jsd.document.model = {
            1: 900000,
        };

        // this succeeds
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
            },
        };
    });

    it("JSD Wildcard TYPES example should work", (done) => {
        // creates a schema that lets key `value` be set to any scalar type (string, bool, number etc)
        const _schema = {
            value: {
                type: "*",
            }
        };

        const _handler = {
            next: (val) => {
                // outputs: {"value":900000}
                // outputs: {"value":"A string"}
                // outputs: {"value":false}
                console.log(`${val}`);
                _jsd.document.unsubscribe();
                done()
            },
            error: (e) => {
                // error: element 'bogus' is not a valid element
                console.log(`error: ${e}`);
            }
        };

        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);

        // any model with the key named `value` is ok
        _jsd.document.model = {
            value: 900000,
        };

        // any model with the key named `value` is ok
        _jsd.document.model = {
            value: "A string",
        };

        // any model with the key named `value` is ok
        _jsd.document.model = {
            value: false,
        };

        // this will fail because key `bogus` is not allowed
        _jsd.document.model = {
            bogus: "false",
        };
    });

    it("JSD Polymorphism example should work", (done) => {
        const _schema = {
            polyValue: {
                required: true,
                default: "DEFAULT VALUE",
                polymorphic: [
                    // this schema will accept a string value
                    {
                        type: "String",
                        restrict: "^[a-zA-Z0-9_\\s]+$",

                    },
                    // ... or and object with `name` and `description` elements
                    {
                        type: "Object",
                        elements: {
                            name: {
                                type: "String",
                                required: true,
                                restrict: "^[a-zA-Z0-9_\\s]{1,24}$"
                            },
                            description: {
                                type: "String",
                                required: true,
                                restrict: "^[a-zA-Z0-9_\\s]{1,140}$"
                            },
                        },
                    },
                    // ... or a wildcard key & numeric value pair
                    {
                        type: "Object",
                        elements: {
                            "*": {
                                type: "Number"
                            },
                        },
                    }]
            }
        };
        let _cnt = 0;
        const _handler = {
            next: (val) => {
                // {"polyValue":"DEFAULT VALUE"}
                // {"polyValue":"HeavyMetalPrincess"}
                // {"polyValue":{"name":"HeavyMetalPrincess","description":"cupcakes"}}
                // {"polyValue":{"HeavyMetalPrincess":10001234}}
                console.log(`${val}`);
                if ((++_cnt) === 4) {
                    done();
                }
            },
            error: (e) => {
                // error: 'polyValue.polymorphic.2.*' expected number, type was '<string>'
                console.log(`error: ${e}`);
            }

        };

        const _jsd = new JSD(_schema, {debug: true});
        _jsd.document.subscribe(_handler);

        // will set default value
        _jsd.document.model = {};


        // can be a string value
        _jsd.document.model = {
            "polyValue": "HeavyMetalPrincess",
        }

        // can be an object with `name` and `description` elements
        _jsd.document.model = {
            "polyValue": {
                "name": "HeavyMetalPrincess",
                "description": "cupcakes",
            }
        };

        // or a wildcard key & numeric value pair...

        // -- this will error because the value is a string, not numeric
        _jsd.document.model = {
            "polyValue": {
                HeavyMetalPrincess: "10001234",
            },
        };

        // -- this has a numeric value and will succeed
        _jsd.document.model = {
            "polyValue": {
                HeavyMetalPrincess: 10001234,
            },
        };
    });
});