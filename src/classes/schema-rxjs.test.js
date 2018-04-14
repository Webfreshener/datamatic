import {Schema} from "./schema";
import {JSD} from "./jsd";

describe("Schema RXJS Test Suite", () => {
    describe("Data Validation", () => {
        let _schema;
        beforeEach(() => {
            _schema = {
                properties: {
                    value: {
                        type: "String"
                    }
                }
            };
        });

        it("should validate string values", (done) => {
            const _h = {
                next: () => {
                    expect(s.get("value")).toEqual("test");
                },
                error: (e) => {
                    expect(e).toEqual("'value' expected string, type was '<boolean>'");
                    done();
                }
            };

            const s = new JSD(_schema);
            s.document.subscribe(_h);
            // -- this must pass
            s.document.model = {
                value: "test"
            };
            // -- this must fail
            s.document.set("value", false);
        });

        it("should validate numeric values", (done) => {
            const _h = {
                next: () => {
                    expect(s.get("value")).toEqual(123);
                },
                error: (e) => {
                    expect(e).toEqual("'value' expected number, type was '<string>'");
                    done();
                }
            };
            const _s = Object.assign({}, _schema);
            _s.properties.value.type = "Number";
            const s = new JSD(_s);
            s.document.subscribe(_h);
            s.document.set("value", 123);
            s.document.set("value", "fails");
        });

        it("should validate boolean values", (done) => {
            const _h = {
                next: () => {
                    expect(s.get("value")).toEqual(false);
                },
                error: (e) => {
                    expect(e).toEqual("'value' expected boolean, type was '<number>'");
                    done();
                }
            };
            const _s = Object.assign({}, _schema);
            _s.properties.value.type = "Boolean";
            const s = new JSD(_s);
            s.document.subscribe(_h);
            s.document.set("value", false);
            s.document.set("value", 0);
        });

        it("should value mixed objects", (done) => {
            const _h = {
                next: (s) => {
                    expect(s.model.obj.objValue).toEqual("Object Value");
                    done();
                },
                error: (e) => {
                    expect(e).toEqual("'obj.objValue' expected string, type was '<object>'");
                    done();
                }
            };
            const _s = Object.assign({}, _schema);
            _s.properties.obj = {
                type: "Object",
                required: true,
                properties: {
                    objValue: {
                        type: "String",
                        required: true,
                    }
                }
            };
            const jsd = new JSD(_s);
            jsd.document.subscribe(_h);
            jsd.document.model = {
                value: "A Value",
                obj: {
                    objValue: "Object Value"
                }
                // obj: {}
            };

        });
    });

    describe("Client Collection", function () {
        let _schema;
        beforeEach(() => {
            let _s = require("../../fixtures/client_collection.schema.json");
            _schema = new JSD(_s);
        });

        it("should check for valid properties", (done) => {
            const _d = {
                name: "Test",
                description: "some text here",
                plural: "falsey",
                base: "foo",
                http: true,
                strict: "false",
                options: {
                    idInjection: true,
                    validateUpsert: false
                },
                // validations: [],
                relations: {
                    myRelation: {
                        type: "foo",
                        polymorphic: "testing",
                        model: "",
                        foreignKey: "name"
                    }
                },
                scope: {},
                scopes: {},
                properties: {}
            };
            const _h = {
                next: (model) => {
                    console.log(`\n\nmodel: ${model}\n`);
                    done("error was expected");
                    // done();
                },
                error: (e) => {
                    console.log(`\n\nmodel: ${_schema.document}\n`);
                    expect(e).toEqual("'http' expected value of type 'Object'. Type was '<boolean>'");
                    done();
                }
            };
            _schema.document.subscribe(_h);
            _schema.document.model = _d;
        });

        it("should pass valid models", (done) => {
            const _d = {
                name: "Test",
                description: "some text here",
                plural: "falsey",
                base: "foo",
                http: {
                    path: "/"
                },
                strict: false,
                options: {
                    idInjection: true,
                    validateUpsert: false
                },
                // validations: [],
                relations: {
                    myRelation: {
                        type: "belongsTo",
                        polymorphic: "testing",
                        model: "MyModel",
                        foreignKey: "name"
                    }
                },
                // scope: {},
                // scopes: {},
                properties: {}
            };
            const _h = {
                next: (model) => {
                    done();
                },
                error: (e) => {
                    done(`error '${e}' was given`);
                }
            };
            _schema.document.subscribe(_h);
            _schema.document.model = _d;
        });
    });

    describe("sequential operation", () => {
        it("should allow updated from within notifications", (done) => {
            const _schema = new JSD({"*": {type: "*"}});
            let cnt = 0;
            const _h = {
                next: (model) => {
                    if (++cnt < 2) {
                        _schema.document.set("valueD", 4);
                    } else {
                        done();
                    }
                },
                error: (e) => {
                    done(`${e}`);
                }
            };

            _schema.document.subscribe(_h);
            _schema.document.model = {
                valueA: 1,
                valueB: 2,
                valueC: 3
            };
        });
    });

    describe("Rxjs Unsubscribe", () => {
        it("should Unsubscribe from notifications", (done) => {
            const _schema = new JSD({"*": {type: "*"}});
            let cnt = 0;
            const _h1 = {
                next: (model) => {
                    if (++cnt < 2) {
                        _sub.unsubscribe();
                        _schema.document.subscribe(_h2);
                        _schema.document.set("valueD", 4);
                    } else {
                        done("should not have recieved notification");
                    }
                },
                error: (e) => {
                    done(`${e}`);
                }
            };

            const _h2 = {
                next: (model) => {
                        done();
                },
            };

            const _sub = _schema.document.subscribe(_h1);
            _schema.document.model = {
                valueA: 1,
                valueB: 2,
                valueC: 3
            };
        });
    })
});