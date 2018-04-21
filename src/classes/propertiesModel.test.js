import {PropertiesModel} from "./propertiesModel";
import {RxVO} from "./rxvo";
import {default as deepEqual} from "deep-equal";
import {basicModel, nestedModel} from "../../fixtures/PropertiesModel.schemas";

describe("PropertiesModel Class Suite", function () {

    describe.only("Simple PropertiesModel Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO(basicModel);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.rxvo.model.$ref).toBeDefined();
                expect(this.rxvo.model.$ref instanceof PropertiesModel).toBe(true);
                expect(this.rxvo.model.$ref).toBeDefined();
                expect(this.rxvo.model.$ref instanceof PropertiesModel).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, basicModel, {
                    properties: {
                        "bad thing": {
                            type: "INVALID",
                        },
                    },
                });
                expect(() => new RxVO(badSchema)).toThrow();
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

                this.rxvo.model = _d;
                expect(deepEqual(this.rxvo.model, _d)).toBe(true);
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    name: "Ed Testy",
                    age: 99,
                    active: "123",
                };

                this.rxvo.model = _d;
                expect(deepEqual(this.rxvo.model, {})).toBe(true);
            });
        });

        describe.only("LifeCycle: Update", () => {
            const _d = {
                name: "Ed Testy",
                age: 99,
                active: true,
            };

            beforeEach(() => {
                this.rxvo.model = _d;
            });

            it("should update with valid data", () => {
                this.rxvo.model.active = false;
                expect(deepEqual(this.rxvo.model, _d)).toBe(false);
            });

            it.only("should reject invalid data update", () => {
                this.rxvo.model.active = "false";
                expect(deepEqual(this.rxvo.model, _d)).toBe(true);
            });
        });
    });

    describe("Nested PropertiesModel Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO(nestedModel);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(this.rxvo.model.$ref).toBeDefined();
                expect(this.rxvo.model.$ref instanceof PropertiesModel).toBe(true);
                expect(this.rxvo.model.$ref).toBeDefined();
                expect(this.rxvo.model.$ref instanceof PropertiesModel).toBe(true);
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

                this.rxvo.model = _d;
                expect(deepEqual(this.rxvo.model, _d)).toBe(true);
                expect(this.rxvo.model.aObject.bObject.$ref).toBeDefined();
                expect(this.rxvo.model.aObject.bObject.$ref instanceof PropertiesModel).toBe(true)
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: "1234",
                        },
                    },
                };

                this.rxvo.model = _d;
                expect(deepEqual(this.rxvo.model, {})).toBe(true);
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

                this.rxvo.model = _d;

                _d = {
                    bValue: 4321,
                };

                this.rxvo.model.aObject.bObject = _d;
                expect(this.rxvo.errors).toBe(null);
                expect(deepEqual(this.rxvo.model.aObject.bObject, _d)).toBe(true);
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
                this.rxvo.model = _d;
                expect(this.rxvo.model.extraObject.someValue).toBe("test");
                delete this.rxvo.model.extraObject.someValue;
                expect(this.rxvo.errors).toBe(null);
                expect(this.rxvo.model.extraObject.someValue).toBe(void(0));
            });

            it("should prevent deletion of nested properties that are required", () => {
                this.rxvo.model = _d;
                expect(this.rxvo.model.aObject.bObject.bValue).toBe(1234);
                delete this.rxvo.model.aObject.bObject.bValue;
                expect(typeof this.rxvo.errors).toBe("object");
                expect(this.rxvo.model.aObject.bObject.bValue).toBe(1234);
            });
        });
    });
});
