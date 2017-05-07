import {should, expect} from "chai";
let {Schema} = require("./src/schema.js");
should();

describe("Schema Class Test Suite", function () {
    describe("Schema Validation Methods", function () {
        it("should not allow Elements without a type or type parameter", function () {
            expect(() => new Schema({value: {foo: "test"}})).to.throw(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow Elements with a valid type parameter", function () {
            expect(() => new Schema({value: {type: "String"}})).to.not.throw(
                "value for schema element 'value' was malformed. Property 'type' was missing");
        });
        it("should not allow invalid Element Types", () => {
            expect(() => new Schema({value: "test"})).to.throw(
                "value for schema element 'value' has invalid type '<Test>'");
        });
        it("should allow String type", function () {
            expect(() => new Schema({value: "String"})).to.not.throw(
                "schema element was malformed");
        });
        it("should allow Numeric type", function () {
            expect(() => new Schema({value: "Number"})).to.not.throw(
                "schema element was malformed");
        });
        it("should allow Boolean type", function () {
            expect(() => new Schema({value: "Boolean"})).to.not.throw(
                "schema element was malformed");
        });
        it("should allow Object type", function () {
            expect(() => new Schema({value: "Object"})).to.not.throw(
                "schema element was malformed");
        });
        let o = {
            value: {
                type: "String",
                foo: "test"
            }
        };
        it("should accept only valid keys on nested objects", function () {
            expect(() => new Schema(o)).to.throw(
                "schema element 'value.foo' is not allowed");
        });
        it("should ensure only valid types on nested elements", function () {
            expect(() => new Schema(o, {extensible: true})).to.throw(
                "type '<test>' for schema element 'value.foo' was invalid");
        });
        it("should allow propery types elements to be added if schema node is extensible", function () {
            o.value.foo = "String";
            expect(() => new Schema(o, {extensible: true})).to.not.throw(
                "schema element 'value.foo' is not allowed");
        });
    });
    describe("Schema Data Validation Methods", function () {
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

        it("should only allow valid types", () => {
            return expect(() => new Schema({value: {type: "Nada"}})).to.throw(
                "value for schema element 'value' has invalid type '<Nada>'");
        });

        it("should init with valid schema", () => {
            expect(() => new Schema({value: {type: "String"}})).to.not.throw(
                "invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'");
        });

        it("should allow a function type", () => {
            expect(() => new Schema({
                value: {
                    type() {
                    }
                }
            })).to.not.throw(
                "invalid schema element 'type' requires one of [String,Function,Object] type was '<Function>'");
        });

        it("should validate values", () => {
            let _S = new Schema({
                elements: {
                    value: {
                        type: "String"
                    }
                }
            });
            expect(_S.set("value", "test") instanceof Schema).to.be.true;
            (_S.get("value")).should.equal("test");
        });
    });

    describe("Schema Initialization Methods", function () {
        it("should initialize from schema file", () => {
            let _s = require("./fixtures/simple.schema.json");
            // expect(=> new Schema name: {type: "String", restrict: "^(\b(?:(?:$"}).to.throw "Regular Expression provided for "name.restrict" was invalid"
            expect(() => new Schema(_s)).to.not.throw("type '<^[a-zA-Z-0-9_]+$>' for schema element 'name.restrict' was invalid");
        });

        it("should check for required fields", () => {
            let _schema = new Schema({
                elements: {
                    name: {type: "String", required: true},
                    description: {type: "String", required: true}
                }
            });
            let _d = {
                name: "Test"
            };
            expect(_schema.set(_d)).to.eq(
                "required property 'description' is missing for 'root element'");
        });
    });

    describe("Polymorphism", function () {
        it("should initialize from polymorphic schema fixture", () => {
            let _s = require("./fixtures/polymorphic.schema.json");
            this.schema = new Schema(_s);
            expect(this.schema instanceof Schema).to.be.true;
        });


        it("should check for polymorphic properties", () => {
            let _d = {
                badParam: false//,

                //			objType1: {
                //				id: 0,
                //				name: "myName",
                //				desc: "some text"
                //			},
                //			objType2: {
                //				id: 0,
                //				active: true
                //			},
            }
            //
            expect(this.schema.set(_d)).to.eq(
                "badParam expected value of type 'Object'. Type was '<boolean>'");
            //	_d.badParam = 1;
            //    expect(this.schema.set(_d)).to.eq(
            //    		"'badParam' expected Object, type was '<number>'");
            //	_d.badParam = {
            //		id: "0",
            //		name: "myName",
            //		desc: "sometext"//,
            ////		bad: "bad"
            //	}
            //	console.log(`res: ${this.schema.set(_d)}`);
            //	expect(this.schema.set(_d) instanceof Schema).to.be.true;
        });
    });

    describe("Client Schema", function () {
        "use strict";
        it("should initialize from client.schema schema fixture", () => {
            let _s = require("./fixtures/client.schema.json");
            this.schema = new Schema(_s);
            expect(this.schema instanceof Schema).to.be.true;
            this.schema.set("__OPTIONS__", _s.__OPTIONS__.default);
            console.log(this.schema.toString(true));
        });
    });

    describe("Client Collection", function () {
        it("should initialize from client_collection schema fixture", () => {
            let _s = require("./fixtures/client_collection.schema.json");
            this.schema = new Schema(_s);
            expect(this.schema instanceof Schema).to.be.true;
        });

        it("should check for valid properties", () => {
            let _d = {
                name: "Test",
                description: "some text here",
                plural: "falsey",
                base: "foo",
                http: true,
                strict: false,
                options: {
                    idInjection: true,
                    validateUpsert: false
                },
                validations: {},
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
                properties: {},
                foo: {}
            };
            let _ = this.schema.set(_d);
            expect(_).to.eq("http expected value of type 'Object'. Type was '<boolean>'");
            _d.http = {
                path: "/api"
            };
            _d.relations.myRelation.type = "belongsTo";
            _d.relations.myRelation.model = "ModelName";
            delete _d.foo;
            _ = this.schema.set(_d);
            expect(_ instanceof Schema).to.be.true;
        });

        it("should check for required fields on elements", () => {
            let _d = {
                name: "Test",
                description: "some text here",
                plural: "Tests",
                base: "foo",
                http: {path: "api"},
                strict: false,
                options: {
                    idInjection: true
                },
                validations: {},
                relations: {},
                scope: {},
                scopes: {},
                properties: {}
            };
            let res = this.schema.set(_d);
            expect(res instanceof Schema).to.be.true;

            _d = Object.assign(_d, {
                properties: {
                    type: "Boolean",
                    name: "Test"
                }
            });
            return expect(() => this.schema.set(_d)).to.not.throw(
                "required property 'type' is missing");
        });
    });

    describe("Getters/Setters", function () {
        it("should set basic values on elements", () => {
            let _schema = new Schema({
                bool: {type: "Boolean"},
                num: {type: "Number"},
                str: {type: "String"}
            });
            _schema.set("bool", false);
            _schema.get("bool").should.be.false
            _schema.set("num", 123);
            _schema.get("num").should.eq(123);
            _schema.set("str", "test");
            _schema.get("str").should.eq("test");
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
            });
            _schema.set("nested", {name: "Ishmael"});
            JSON.parse("" + _schema).nested.name.should.eq("Ishmael");
        });
    });

    describe("Default Values", function () {
        it("should set default value if exists in JSD", () => {
            let _jsd = {
                value: {
                    type: "Number",
                    required: true
                },
                str: {
                    type: "String",
                    required: true,
                    "default": "DEFAULT VALUE"
                }
            };
            let _ = new Schema(_jsd, {extensible: true});
            _.set({value: 123}).get("str").should.eq("DEFAULT VALUE");
        });
    });

    describe("Deep Object Nesting", function () {
        it("should handle deep object nesting", () => {
            let _schema = new Schema(require("./fixtures/nested-elements.schema.json"));
            expect(_schema instanceof Schema).to.be.true;
            //    expect((_schema.set(_d = require("./fixtures/nested.data.json"))).valueOf().NestedObjects).to.exist;
            //    return expect(JSON.stringify(_d)).to.equal(_schema.toString());
        });
    })
});

// # TO-DO:
// it "should handle defaults and restrictions", =>
// _s =
// elements:
// foo:
// type: "String"
// restrict: "^[a-zA-Z0-9\\\s\\\.]{1,}$"
// # default: "Hello World"
// required: false
// @schema = new Schema _s
// @schema.set foo:"Goodnight Moon?"
// expect(@schema.get "foo").to.not.exist
// @schema.set foo:"Goodnight Moon"
// expect(@schema.get "foo").to.eq "Goodnight Moon"
// 
// it "should set a value to the schema", =>
// _s = require "./schemas/simple.json"
// @schema = new Schema _s
// ((@schema.set "name", "Test") instanceof Schema).should.be.true
// 
// it "should get a value from the schema", =>
// (@schema.get "name").should.equal "Test"
