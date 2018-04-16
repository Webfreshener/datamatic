import {PropertiesModel} from "./propertiesModel";
import {JSD} from "./jsd";
import {default as deepEqual} from "deep-equal";
import {basicModel, nestedModel} from "../../fixtures/PropertiesModel.schemas";

describe("PropertiesModel Class Suite", function () {

    describe("Simple PropertiesModel Tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(basicModel);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof PropertiesModel).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof PropertiesModel).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, basicModel, {
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

    describe("Nested PropertiesModel Tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(nestedModel);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof PropertiesModel).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof PropertiesModel).toBe(true);
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
                expect(this.jsd.document.model.aObject.bObject.$ref instanceof PropertiesModel).toBe(true)
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

        describe("LifeCycle: Delete", () => {

            let _d = {
                aObject: {
                    bObject: {
                        bValue: 1234,
                    },
                },
                extraObject: {
                    someValue: "test",
                },
            };

            it("should allow deletion of nested properties that are not required", () => {
                this.jsd.document.model = _d;
                expect(this.jsd.document.model.extraObject.someValue).toBe("test");
                delete this.jsd.document.model.extraObject.someValue;
                expect(this.jsd.errors).toBe(null);
                expect(this.jsd.document.model.extraObject.someValue).toBe(void(0));
            });

            it("should prevent deletion of nested properties that are required", () => {
                this.jsd.document.model = _d;
                expect(this.jsd.document.model.aObject.bObject.bValue).toBe(1234);
                delete this.jsd.document.model.aObject.bObject.bValue;
                expect(typeof this.jsd.errors).toBe("object");
                expect(this.jsd.document.model.aObject.bObject.bValue).toBe(1234);
            });
        });
    });
});
