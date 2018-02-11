import {Schema} from "./schema";
import {JSD} from "./jsd";

describe("Schema RXJS Test Suite", () => {
    describe("Data Validation", () => {
        let _schema;
        beforeEach(() => {
            _schema = {
                elements: {
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

            const s = new Schema(_schema, null, new JSD());
            s.subscribe(_h);
            // -- this must pass
            s.set("value", "test");
            // -- this must fail
            s.set("value", false);
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
            _s.elements.value.type = "Number";
            const s = new Schema(_s, null, new JSD());
            s.subscribe(_h);
            s.set("value", 123);
            s.set("value", "fails");
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
            _s.elements.value.type = "Boolean";
            const s = new Schema(_s, null, new JSD());
            s.subscribe(_h);
            s.set("value", false);
            s.set("value", 0);
        });

        it("should value mixed objects", (done) => {
            const _h = {
                next: () => {
                    expect(s.model.obj.objValue).toEqual("Object Value");
                    done();
                },
                error: (e) => {
                    expect(e).toEqual("'obj.objValue' expected string, type was '<object>'");
                    done();
                }
            };
            const _s = Object.assign({}, _schema);
            _s.elements.obj = {
                type: "Object",
                required: true,
                elements: {
                    objValue: {
                        type: "String",
                        required: true,
                    }
                }
            };
            const s = new Schema(_s, null, new JSD());
            s.subscribe(_h);
            s.model = {
                value: "A Value",
                obj: {
                    objValue: "Object Value"
                }
                // obj: {}
            };

        });
    });

    describe("Client Schema", function () {
        it("should initialize from client.schema schema fixture", () => {
            let _s = require("../../fixtures/client.schema.json");
            this.schema = new Schema(_s, null, new JSD()).subscribeTo("__OPTIONS__.ALLOWED", {
                next: (v) => {
                    console.log(`next: ${JSON.stringify(v)}`);
                },
                error: (e) => {
                    console.log(`e ${e}`);
                }
            });
            expect(this.schema instanceof Schema).toBe(true);
            expect(this.schema.model.__OPTIONS__.CRUD_METHODS.create).toEqual("POST");
        });
    });

    describe("Client Collection", function () {
        let _schema;
        beforeEach(() => {
            let _s = require("../../fixtures/client_collection.schema.json");
            _schema = new Schema(_s, null, new JSD());
        });

        // it("should initialize from client_collection schema fixture", () => {
        //     expect(_schema instanceof Schema).toBe(true);
        // });

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
                properties: {}
            };
            const _h = {
                next: () => {
                    throw "error was expected";
                },
                error: (e) => {
                    expect(e).toEqual("http expected value of type 'Object'. Type was '<boolean>'");
                    done();
                }
            };
            _schema.subscribe(_h);
            _schema.model = _d;
        });
    });
});