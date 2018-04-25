import {PropertiesModel} from "./propertiesModel";
import {RxVO} from "./rxvo";
import {default as deepEqual} from "deep-equal";
import {getPatternPropertyDefaults} from "./utils";
import {
    basicModel, nestedModel,
    nestedModelDefault, nestedPatternModel, patternModel
} from "../../fixtures/PropertiesModel.schemas";

describe("PropertiesModel Class Suite", function () {

    describe("Simple PropertiesModel Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO(basicModel);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.rxvo.model.$model).toBeDefined();
                expect(this.rxvo.model.$model instanceof PropertiesModel).toBe(true);
                expect(this.rxvo.model.$model).toBeDefined();
                expect(this.rxvo.model.$model instanceof PropertiesModel).toBe(true);
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

        describe("LifeCycle: Update", () => {
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

            it("should reject invalid data update", () => {
                this.rxvo.model.active = "false";
                expect(deepEqual(this.rxvo.model, _d)).toBe(true);
            });
        });
    });

    describe("Nested PropertiesModel Tests", () => {
        let _rxvo;
        beforeEach(() => {
            _rxvo = new RxVO(nestedModel)
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(_rxvo.model.$model).toBeDefined();
                expect(_rxvo.model.$model instanceof PropertiesModel).toBe(true);
                expect(_rxvo.model.$model).toBeDefined();
                expect(_rxvo.model.$model instanceof PropertiesModel).toBe(true);
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

                _rxvo.model = _d;
                expect(deepEqual(_rxvo.model, _d)).toBe(true);
                expect(_rxvo.model.aObject.bObject.$model).toBeDefined();
                expect(_rxvo.model.aObject.bObject.$model instanceof PropertiesModel).toBe(true)
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: "1234",
                        },
                    },
                };

                _rxvo.model = _d;
                expect(deepEqual(_rxvo.model, {})).toBe(true);
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

                _rxvo.model = _d;

                _d = {
                    bValue: 4321,
                };

                _rxvo.model.aObject.bObject = _d;
                expect(_rxvo.errors).toBe(null);
                expect(deepEqual(_rxvo.model.aObject.bObject, _d)).toBe(true);
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
                _rxvo.model = _d;
                expect(_rxvo.model.extraObject.someValue).toBe("test");
                delete _rxvo.model.extraObject.someValue;
                expect(_rxvo.errors).toBe(null);
                expect(_rxvo.model.extraObject.someValue).toBe(void(0));
            });

            it("should prevent deletion of nested properties that are required", () => {
                _rxvo.model = _d;
                expect(_rxvo.model.aObject.bObject.bValue).toBe(1234);
                delete _rxvo.model.aObject.bObject.bValue;
                expect(typeof _rxvo.errors).toBe("object");
                expect(_rxvo.model.aObject.bObject.bValue).toBe(1234);
            });
        });
    });

    describe("Nested Defaults PropertiesModel Tests", () => {
        let _rxvo;
        beforeEach(() => {
            _rxvo = new RxVO(nestedModelDefault);
        });

        it("should populate default values", () => {
            _d = {
                aObject: {
                    bObject: {},
                },
            };

            _rxvo.model = _d;
            expect(_rxvo.model.aObject.bObject.bValue).toBe(123);
        });
    });

    describe("PatternProp Defaults Tests", () => {
        const _rxvo = new RxVO(patternModel);

        it("should populate default values", () => {
            _rxvo.model = {
                name: "Object Name",
                nested: {},
            };
            expect(_rxvo.model.nested.value).toBe("default value");
        });
    });
});
