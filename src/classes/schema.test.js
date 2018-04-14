import {Schema} from "./schema";
import {JSD} from "./jsd";
import {_vBuilders} from "./_references";
import {default as deepEqual} from "deep-equal";

describe("Schema Class Test Suite", function () {
    describe("Schema Validation Methods", function () {
        it("should not allow properties without a type or type parameter", function () {
            expect(() => new JSD({value: {foo: "test"}})).toThrow(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow properties with a valid type parameter", function () {
            expect(() => new JSD({value: {type: "String"}})).not.toThrow(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow invalid Element Types", () => {
            expect(() => new JSD({value: "test"})).toThrow(
                "type '<test>' for schema element 'value' was invalid");
        });
        it("should allow String type", function () {
            expect(() => new JSD({value: "String"})).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Numeric type", function () {
            expect(() => new JSD({value: "Number"})).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Boolean type", function () {
            expect(() => new JSD({value: "Boolean"})).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Object type", function () {
            expect(() => new JSD({value: "Object"})).not.toThrow(
                "schema element was malformed");
        });
        let o = {
            value: {
                type: "String",
                foo: "test"
            }
        };
        it("should accept only valid keys on nested objects", function () {
            expect(() => new JSD(o)).toThrow(
                "schema element 'value.foo' is not allowed");
        });
        it("should ensure only valid types on nested properties", function () {
            expect(() => new JSD(o, {extensible: true})).toThrow(
                "schema element 'value.foo' is not allowed");
        });
    });
    describe("Schema Data Validation Methods", function () {
        it("should only allow valid types", () => {
            return expect(() => new JSD({value: {type: "Nada"}})).toThrow(
                "value for schema element 'value' has invalid type '<Nada>'");
        });

        it("should init with valid schema", () => {
            expect(() => new JSD({value: {type: "String"}})).not.toThrow(
                "invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'");
        });

        it("should allow a function type", () => {
            expect(() => new JSD({
                value: {
                    type() {
                    }
                }
            })).not.toThrow(
                "invalid schema element 'type' requires one of [String,Function,Object] type was '<Function>'");
        });

        it("should validate values", () => {
            let _schema = new JSD({
                value: {
                    type: "String"
                }
            });

            console.log(_vBuilders.get(_schema).list());
            // _schema.document.set("value", "test");
            _schema.document.model = {
                value: "test",
            };
            console.log(_schema.document.validate());
            expect(_schema.document.isValid).toEqual(true);
        });
    });

    describe("Schema Initialization Methods", function () {
        it("should initialize from schema file", () => {
            let _s = require("../../fixtures/simple.schema.json");
            // expect(=> new Schema name: {type: "String", restrict: "^(\b(?:(?:$"}).to.throw "Regular Expression provided for "name.restrict" was invalid"
            expect(() => new Schema(_s)).not.toThrow("type '<^[a-zA-Z-0-9_]+$>' for schema element 'name.restrict' was invalid");
        });

        it("should check for required fields", () => {
            let _s = {
                name: {
                    type: "String",
                    required: true
                },
            };
            let _jsd = new JSD(_s)
            let _schema = new Schema(_s, null, _jsd);
            let _d = {
                name: "Test"
            };
            _schema.set(_d);
            expect(_schema.model.hasOwnProperty("name")).toEqual(true);
        });
    });

    describe("Wildcards", function () {
        let _jsd;
        beforeEach(() => {
            let _s = require("../../fixtures/wildcard.schema.json");
            _jsd = new JSD(_s);
        });

        it("should validate arbitrary wildcard properties", (done) => {
            const _h = {
                next: (o) => {
                    _sub.unsubscribe();
                    done("should have dispatched an error");
                },
                error: (e) => {
                    _sub.unsubscribe();
                    done();
                }
            };

            let _sub = _jsd.document.subscribe(_h);
            _jsd.document.model = {
                foo: {
                    bar: {
                        active: {
                            foo: "bar"
                        },
                        name: 123,
                    }
                }
            };
        });

        it("should validate nested wildcard properties", (done) => {
            const _h = {
                next: (o) => {
                    _sub.unsubscribe();
                    done();
                },
                error: (e) => {
                    console.log(e);
                    _sub.unsubscribe();
                    done(`${e}`);
                }
            };

            let _sub = _jsd.document.subscribe(_h);
            _jsd.document.model = {
                foo: {
                    bar: {
                        active: true,
                        name: "Sam",
                    }
                }
            };
        });

        it("should validate Wildcard Types", () => {
            _jsd = new JSD({foo: {type: "*"}});
            _jsd.document.model = {
                foo: 123,
            };
            expect(_jsd.document.model.foo).toBe(123);

        })
    });

    describe("Getters/Setters", () => {
        it("should set basic values on properties", () => {
            let _schema = new JSD({
                bool: {type: "Boolean"},
                num: {type: "Number"},
                str: {type: "String"}
            });
            _schema.document.set("bool", false);
            expect(_schema.document.get("bool")).toBe(false);
            _schema.document.set("num", 123);
            expect(_schema.document.get("num")).toEqual(123);
            _schema.document.set("str", "test");
            expect(_schema.document.get("str")).toEqual("test");
        });

        it("should set object values on properties", () => {
            let _schema = new JSD({
                nested: {
                    type: "Object",
                    properties: {
                        name: {
                            type: "String"
                        }
                    }
                }
            });
            _schema.document.set("nested", {name: "Ishmael"});
            expect(JSON.parse(`${_schema.document}`).nested.name).toEqual("Ishmael");
        });

        it("should set Array values on properties", () => {
            let _schema = new JSD({
                root: {
                    type: "Object",
                    properties: {
                        child: {
                            type: "Object",
                            properties: {
                                value: {
                                    type: "String",
                                    required: true,
                                },
                            },
                        },
                        nested: {
                            type: "Array",
                            properties: {
                                type: "Object",
                                properties: {
                                    name: {
                                        type: "String",
                                    },
                                },
                            },
                        },
                    },
                },
            });
            _schema.document.subscribe({
                next: (val) => {
                    console.log(`${val}`);
                },
                error: (e) => {
                    console.log(`e: ${e}`);
                }
            });
            _schema.document.model = {
                root: {
                    child: {
                        value: "foo",
                    },
                    nested: [{name: "Ishmael"}],
                },
            };
            _schema.document.model.root.$ref.set("nested", [{name: "Ishmael"}]);
            console.log(`results: ${_schema.document}`);
            expect(Array.isArray(_schema.document.model.root.nested)).toBe(true);
            expect(_schema.document.model.root.nested.length).toBe(1);
            expect(_schema.document.model.root.nested[0].name).toEqual("Ishmael");

            // expect(Array.isArray(_schema.document.model.root.nested)).toBe(true);
            // expect(_schema.document.model.root.nested.length).toBe(0);
        })
    });

    describe("Default Values", function () {
        it("should set default value if exists in JSD", () => {
            let _jsd = {
                value: {
                    type: "Number",
                    required: true,
                },
                str: {
                    type: "String",
                    required: true,
                    default: "DEFAULT VALUE",
                },
                active: {
                    type: "Boolean",
                    required: true,
                    default: false,
                }
            };
            let _ = new JSD(_jsd);
            _.document.model = {value: 123};
            expect(_.document.model.value).toEqual(123);
            expect(_.document.model.str).toEqual("DEFAULT VALUE");
            expect(_.document.model.active).toEqual(false);
            _.document.model = {value: 456, str: "USER VALUE", active: true};
            expect(_.document.model.str).toEqual("USER VALUE");
            expect(_.document.model.active).toEqual(true);
        });
    });

    describe("Deep Object Nesting", function () {
        const _schema = require("../../fixtures/nested-elements.schema.json");
        const _data = require("../../fixtures/_nested.data.json");
        const _jsd = new JSD(_schema);

        it("should handle deep object nesting", (done) => {
            _jsd.document.subscribe({
                next: (doc) => {
                    console.log(`${doc.validate()}`);
                    expect(_jsd.document.model.NestedObjects.anArray.length).toEqual(2);
                    expect(_jsd.document.model.NestedObjects.anObject.aDeepObject.aDeeperObject).toBeTruthy();
                    expect(_jsd.document.model.NestedObjects.anObject.aDeepObject.aDeeperObject.aDeepParam).toEqual("a deep param");
                    done();
                },
                error: (e) => {
                    // console.log(`e: ${e}`);
                    done(e);
                }
            });
            expect(_jsd.document instanceof Schema).toBe(true);
            _jsd.document.model = _data;
        });
    });

    describe("casting to values", () => {
        const _schema = new JSD(require("../../fixtures/nested-elements.schema.json"));
        const _ts = require("../../fixtures/_nested.data.json");
        _schema.document.model = _ts;
        it("should provide JSON from toJSON", () => {
            expect(deepEqual(_schema.document.toJSON(), _ts)).toEqual(true);
        });
        it("should provide JSON String from toString", () => {
            expect(deepEqual(JSON.parse(`${_schema.document}`), _ts)).toEqual(true);
        });
    });

    describe("debug lazy schemas", () => {
        it("should successfully create lazy schema", () => {
            const jsd = new JSD({foo: {type: "String"}});
            jsd.document.model = {foo: "bar"};
            expect(jsd.document.model.foo).toBe("bar");
        });

    });

    describe("reset model on data", () => {
        it("should reset the model when the model is overwritten", () => {
            const _schema = new Schema({"*": {type: "*"}}, null, new JSD());
            _schema.model = {
                valueA: 1,
                valueB: 2,
                valueC: 3
            };

            _schema.model = {
                valueA: 10,
                valueB: 12,
            };
            expect(_schema.model.hasOwnProperty("valueA")).toBe(true);
            expect(_schema.model.hasOwnProperty("valueB")).toBe(true);
            expect(_schema.model.hasOwnProperty("valueC")).toBe(false);
        });
    });

    describe("Write Lock", () => {
        it("should lock model programmatically  and trigger notification", (done) => {
            const _schema = new Schema({"*": {type: "*"}}, null, new JSD());
            let cnt = 0;
            const _h = {
                next: (model) => {
                    expect(model.hasOwnProperty("valueD")).toBe(false);
                    if (++cnt == 2) {
                        expect(_schema.isLocked).toBe(true);
                        done();
                    }

                },
                complete: (model) => {
                    _schema.set("valueD", 4);
                },
            };

            _schema.subscribe(_h);

            _schema.model = {
                valueA: 1,
                valueB: 2,
                valueC: 3
            };

            _schema.lock();
        });

        it("should lock model via Schema  and trigger notification", (done) => {
            const _schema = new Schema({writeLock: true, properties: {"*": {type: "*"}}}, null, new JSD());
            let cnt = 0;
            const _h = {
                next: (model) => {
                    done()
                    if (++cnt < 2) {
                        expect(_schema.isLocked).toBe(true);
                        _schema.set("valueD", 4);
                    } else {
                        expect(model.hasOwnProperty("valueD")).toBe(false);
                    }
                },
                complete: (model) => {
                    done();
                },
                error: (e) => {
                    done(e);
                }
            };

            _schema.subscribe(_h);

            _schema.model = {
                valueA: 1,
                valueB: 2,
                valueC: 3
            };
        });
    });

    describe("Backref", () => {
        it("should provide backref on model", (done) => {
            const _s = {
                type: "Object",
                properties: {
                    root: {
                        type: "Object",
                        properties: {
                            name: {
                                type: "String"
                            },
                            value: {
                                type: "Number"
                            }
                        }
                    }
                }
            };

            const _jsd = new JSD(_s);
            let cnt = 0;
            const _h = {
                next: (schema) => {
                    console.log(`${JSON.stringify(schema.model.root)}`);
                    expect(schema.model.root.hasOwnProperty("$ref")).toBe(true);
                    expect(schema.model.root.$ref instanceof Schema).toBe(true);
                    done();
                },
                error: (e) => {
                    done(`error: ${e}`);
                },
            };

            _jsd.document.subscribe(_h);

            _jsd.document.model = {
                root: {
                    name: "foo",
                    value: 2,
                },
            };
        });
    });
});
