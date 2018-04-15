import {Schema} from "./schema";
import {JSD} from "./jsd";
import {default as deepEqual} from "deep-equal";
import {default as jsonSchema} from "../../fixtures/simple.schema";
import {default as nestedSchema} from "../../fixtures/simple-nested.schema";


describe("Schema Class Suite", function () {

    describe("Simple Schema Tests", () => {

        beforeEach(() => {
            this.jsd = new JSD(jsonSchema);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof Schema).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof Schema).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, jsonSchema, {
                    properties: {
                        "bad thing": {
                            type: "INVALID",
                        },
                    },
                });
                expect(() => new JSD(badSchema)).toThrow();
            });
        });

        describe("LifeCycle: Creation", () => {

            let _d;

            it("should populate with valid data and make that data accessible", () => {
                _d = {
                    name: "Ed Testy",
                    age: 99,
                    active: true,
                };

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, _d)).toBe(true);
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    name: "Ed Testy",
                    age: 99,
                    active: "123",
                };

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, {})).toBe(true);
            });
        });
    });

    describe("Nested Schema Tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(nestedSchema);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof Schema).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof Schema).toBe(true);
            });
        });

        describe("LifeCycle: Create", () => {

            let _d;

            it("should populate with valid data and make that data accessible", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: 1234,
                        },
                    },
                };

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, _d)).toBe(true);
                expect(this.jsd.document.model.aObject.bObject.$ref).toBeDefined();
                expect(this.jsd.document.model.aObject.bObject.$ref instanceof Schema).toBe(true)
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: "1234",
                        },
                    },
                };

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, {})).toBe(true);
            });
        });

        describe("LifeCycle: Update", () => {

            let _d;

            it("should updated nested property models with valid data and pass validation", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: 1234,
                        },
                    },
                };

                this.jsd.document.model = _d;

                _d = {
                    bValue: 4321,
                };

                this.jsd.document.model.aObject.bObject = _d;
                expect(this.jsd.errors).toBe(null);
                expect(deepEqual(this.jsd.document.model.aObject.bObject, _d)).toBe(true);
            });
        });
    });
});
