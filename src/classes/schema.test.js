import {Schema} from "./schema";
import {JSD} from "./jsd";

describe("Schema Class Test Suite", function () {
    describe("Schema Validation Methods", function () {
        it("should not allow Elements without a type or type parameter", function () {
            expect(() => new Schema({value: {foo: "test"}}, null, new JSD())).toThrow(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow Elements with a valid type parameter", function () {
            expect(() => new Schema({value: {type: "String"}}, null, new JSD())).not.toThrow(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow invalid Element Types", () => {
            expect(() => new Schema({value: "test"}, null, new JSD())).toThrow(
                "type '<test>' for schema element 'value' was invalid");
        });
        it("should allow String type", function () {
            expect(() => new Schema({value: "String"}, null, new JSD())).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Numeric type", function () {
            expect(() => new Schema({value: "Number"}, null, new JSD())).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Boolean type", function () {
            expect(() => new Schema({value: "Boolean"}, null, new JSD())).not.toThrow(
                "schema element was malformed");
        });
        it("should allow Object type", function () {
            expect(() => new Schema({value: "Object"}, null, new JSD())).not.toThrow(
                "schema element was malformed");
        });
        let o = {
            value: {
                type: "String",
                foo: "test"
            }
        };
        it("should accept only valid keys on nested objects", function () {
            expect(() => new Schema(o, null, new JSD())).toThrow(
                "schema element 'value.foo' is not allowed");
        });
        it("should ensure only valid types on nested elements", function () {
            expect(() => new Schema(o, {extensible: true}, new JSD())).toThrow(
                "type '<test>' for schema element 'value.foo' was invalid");
        });
        it("should allow propery types elements to be added if schema node is extensible", function () {
            o.value.foo = "String";
            expect(() => new Schema(o, {extensible: true}, new JSD())).not.toThrow(
                "schema element 'value.foo' is not allowed");
        });
    });
    describe("Schema Data Validation Methods", function () {
        /*
         it("should validate data set to it", function () {
         var _S = new Schema({
         elements: {
         value: "String"
         }
         });
         (_S.set({value: 1}) instanceof Schema).should.be.false;
         //    (_S.set( {value:"1"} ) instanceof Schema).should.be.true;
         //    _S = new Schema({
         //    	elements: {
         //    		value:"Number" }});
         //    (_S.set({value:1}) instanceof Schema).should.be.true;
         //    (_S.set({value:"A String"}) instanceof Schema).should.be.false;
         });
         */
        it("should only allow valid types", () => {
            return expect(() => new Schema({value: {type: "Nada"}}, null, new JSD())).toThrow(
                "value for schema element 'value' has invalid type '<Nada>'");
        });

        it("should init with valid schema", () => {
            expect(() => new Schema({value: {type: "String"}}, null, new JSD())).not.toThrow(
                "invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'");
        });

        it("should allow a function type", () => {
            expect(() => new Schema({
                value: {
                    type() {
                    }
                }
            }, null, new JSD())).not.toThrow(
                "invalid schema element 'type' requires one of [String,Function,Object] type was '<Function>'");
        });

        it("should validate values", () => {
            let _schema = new Schema({
                elements: {
                    value: {
                        type: "String"
                    }
                }
            }, null, new JSD());
            _schema.set("value", "test");
            expect(_schema.isValid).toEqual(true);
        });
    });

    describe("Schema Initialization Methods", function () {
        it("should initialize from schema file", () => {
            let _s = require("../../fixtures/simple.schema.json");
            // expect(=> new Schema name: {type: "String", restrict: "^(\b(?:(?:$"}).to.throw "Regular Expression provided for "name.restrict" was invalid"
            expect(() => new Schema(_s)).not.toThrow("type '<^[a-zA-Z-0-9_]+$>' for schema element 'name.restrict' was invalid");
        });

        it("should check for required fields", () => {
            let _schema = new Schema({
                elements: {
                    name: {
                        type: "String",
                        required: true
                    },
                    // description: {type: "String", required: true}
                }
            }, null, new JSD());
            let _d = {
                name: "Test"
            };
            _schema.set(_d);
            expect(_schema.model.hasOwnProperty("name")).toEqual(true);
        });
    });

    describe("Wildcards", function () {
        it("should initialize from wildcard schema fixture", () => {
            let _s = require("../../fixtures/wildcard.schema.json");
            this.schema = new Schema(_s, null, new JSD());
            expect(this.schema instanceof Schema).toBe(true);
        });
        it("should validate arbitrary wildcard elements", (done) => {
            const _h = {
                next: (o) => {
                    done("should have dispatched an error");
                },
                error: (e) => {
                    console.log(`error: ${e}`);
                    done();
                }
            };
            this.schema.subscribe(_h);
            this.schema.model = {
                foo: {
                    bar: {
                        active: {
                            foo: "bar"
                        },
                        name: 123,
                    }
                }
            };
        })
    });

    describe("Polymorphism", function () {
        it("should initialize from polymorphic schema fixture", () => {
            let _s = require("../../fixtures/polymorphic.schema.json");
            this.schema = new Schema(_s, null, new JSD());
            expect(this.schema instanceof Schema).toBe(true);
        });

        it("should check for polymorphic properties", (done) => {
            let _d = {
                badParam: false
            };

            let _f = {
                next: () => {
                    done("did not fail badParam as expected");
                },
                error: (e) => {
                    expect(e).toEqual("badParam expected value of type 'Object'. Type was '<boolean>'");
                    done();
                }
            };

            let _sub = this.schema.subscribe(_f);
            this.schema.model = _d;
        });
    });

    describe("Getters/Setters", function () {
        it("should set basic values on elements", () => {
            let _schema = new Schema({
                bool: {type: "Boolean"},
                num: {type: "Number"},
                str: {type: "String"}
            }, null, new JSD());
            _schema.set("bool", false);
            expect(_schema.get("bool")).toBe(false);
            _schema.set("num", 123);
            expect(_schema.get("num")).toEqual(123);
            _schema.set("str", "test");
            expect(_schema.get("str")).toEqual("test");
        });

        it("should set object values on elements", () => {
            let _schema = new Schema({
                nested: {
                    type: "Object",
                    elements: {
                        name: {
                            type: "String"
                        }
                    }
                }
            }, null, new JSD());
            _schema.set("nested", {name: "Ishmael"});
            expect(JSON.parse("" + _schema).nested.name).toEqual("Ishmael");
        });
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
            let _ = new Schema(_jsd, null, new JSD());
            _.model = {value: 123};
            expect(_.model.value).toEqual(123);
            expect(_.model.str).toEqual("DEFAULT VALUE");
            expect(_.model.active).toEqual(false);
            _.model = {value: 456, str:"USER VALUE", active: true};
            expect(_.model.str).toEqual("USER VALUE");
            expect(_.model.active).toEqual(true);
        });
    });

    describe("Deep Object Nesting", function () {
        it("should handle deep object nesting", () => {
            const _jsd = require("../../fixtures/nested-elements.schema.json");
            let _schema = new Schema(_jsd, null, new JSD());
            expect(_schema instanceof Schema).toBe(true);
            _schema.model = require("../../fixtures/_nested.data.json");
            expect(_schema.model.NestedObjects.anArray.length).toEqual(2);
            expect(_schema.model.NestedObjects.anObject.aDeepObject.aDeeperObject).toBeTruthy();
            expect(_schema.model.NestedObjects.anObject.aDeepObject.aDeeperObject.aDeepParam).toEqual("a deep param");
        });
    });

    describe("casting to values", () => {
        let _schema;
        const _ts = JSON.stringify({
            NestedObjects: {
                anArray: ["string 1","string 2"],
                anObject: {
                    aString: "TEST",
                    aObject: {},
                    aDeepObject: {
                        aDeepParam: "testing 123",
                        aDeeperObject:{
                            aDeepParam:"a deep param"
                        }
                    }
                }
            }
        });
        beforeEach(()=> {
            _schema = new Schema(require("../../fixtures/nested-elements.schema.json"), null, new JSD());
            _schema.model = require("../../fixtures/_nested.data.json");
        });
        it("should provide JSON from toJSON", () => {
            expect(JSON.stringify(_schema.toJSON())).toEqual(_ts);
        });
        it("should provide JSON String from toString", () => {
            expect(_schema.toString()).toEqual(_ts);
        });
    });

    describe("debug lazy schemas", () => {
        it("should successfully create lazy schema", () => {
            const jsd = new JSD({foo: {type: "String"}});
            jsd.document.model = {foo: "bar"};
            expect(jsd.document.model.foo).toBe("bar");
        });

    });
});