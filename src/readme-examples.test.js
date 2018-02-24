import {JSD} from './index';
import {Set} from './classes/set';
describe('README.md examples tests', () => {
    it('main Schema example should work', (done) => {
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
                    expect(schema.model.name).toBe("Frank");
                    expect(schema.model.age).toBe(23);
                    done();
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
    });

    it('JSD Array example should work', (done) => {
        const _schema = {
            type: "Array",
            default: [],
            elements: {
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
            },
        };

        let _handler = {
            next: (val) => {
                // outputs: {"values":[{"name":"Player 1","score":2000000},{"name":"Player 2","score":1100000},{"name":"Player 3","score":900000}]}
                console.log(`${val}`);
                // _jsd.document.unsubscribe();
                done();
            },
            error: (e) => {
                console.log(`error: ${e}`);
            }
        };

        const _jsd = new JSD(_schema);
        _jsd.document.subscribe(_handler);
        _jsd.document.model = [{
            name: "Player 1",
            score: 2000000,
        }, {
            name: "Player 2",
            score: 1100000
        }, {
        //     name: "BOGUS",
        //     score: "1100000"
        // }, {
            name: "Player 3",
            score: 900000
        }];
    });

    it('JSD Boolean example should work', (done) => {
        const _schema = {
            value: {
                type: "Boolean",
                required: false,
                default: true,
            }
        };

        let _handler = {
            next: (val) => {
                // {"value":true}
                // {"value":true}
                // {"value":false}
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

    it('JSD Number example should work', (done) => {
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
                done();
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
    });

    it('JSD String example should work', (done) => {
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
                done();
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
    });

    it('JSD Object example should work', (done) => {
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
    });

    it('JSD Wildcard KEYS example should work', (done) => {
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

        let _handler = {
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
        _jsd.document.model = {
            1: 900000,
        };
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

    it.only('JSD Wildcard TYPES example should work', (done) => {
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
            },
            error: (e) => {
                // error: element 'bogus' is not a valid element
                console.log(`error: ${e}`);
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

        // this will fail
        _jsd.document.model = {
            bogus: "false",
        };

    });

    it('JSD Polymorphism example should work', (done) => {
        const _schema = {
            polyValue: {
                required: true,
                polymorphic: [{
                    type: "String",
                    restrict: "^[a-zA-Z0-9_\\s]+$",

                }, {
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
                            restrict: "^[a-zA-Z0-9_\\s]{1,24}$"
                        },
                    },
                // }, {
                //     type: "Object",
                //     elements: {
                //         "*": {
                //             type: "Number"
                //         },
                //     },
                }]
            }
        };
        let _cnt = 0;
        let _handler = {
            next: (val) => {
                // {"polyValue":"HeavyMetalPrincess"}
                // {"polyValue":{"name":"HeavyMetalPrincess","description":"cupcakes"}}
                // {"polyValue":{"HeavyMetalPrincess":10001234}}
                console.log(`${val}`);
                if ((++_cnt) === 3) {
                    done();
                }
            },
            error: (e) => {
                console.log(`error: ${e}`);
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
                HeavyMetalPrincess: "10001234",
            },
        };

        _jsd.document.model = {
            "polyValue": {
                HeavyMetalPrincess: 10001234,
            },
        };
    });
});