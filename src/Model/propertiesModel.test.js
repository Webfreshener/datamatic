import {PropertiesModel} from "./propertiesModel";
import {Model} from "./index";
import {default as deepEqual} from "deep-equal";
import {
    basicModel, nestedModel, nestedModelDefault, nestedPatternModel, patternModel
} from "../../fixtures/PropertiesModel.schemas";

describe("PropertiesModel Class Suite", function () {
    let _owner;
    describe("Simple PropertiesModel Tests", () => {
        beforeEach(() => {
            _owner = new Model({schemas: [basicModel]});
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(_owner.model.$model).toBeDefined();
                expect(_owner.model.$model instanceof PropertiesModel).toBe(true);
                expect(_owner.model.$model).toBeDefined();
                expect(_owner.model.$model instanceof PropertiesModel).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, basicModel, {
                    properties: {
                        "bad thing": {
                            type: "INVALID",
                        },
                    },
                });
                expect(() => new Model({schemas: [badSchema]})).toThrow();
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

                _owner.model = _d;
                expect(deepEqual(_owner.model, _d)).toBe(true);
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    name: "Ed Testy",
                    age: 99,
                    active: "123",
                };

                _owner.model = _d;
                expect(deepEqual(_owner.model, {})).toBe(true);
            });
        });

        describe("LifeCycle: Update", () => {
            const _d = {
                name: "Ed Testy",
                age: 99,
                active: true,
            };

            beforeEach(() => {
                _owner.model = _d;
            });

            it("should update with valid data", () => {
                _owner.model.active = false;
                expect(deepEqual(_owner.model, _d)).toBe(false);
            });

            it("should reject invalid data update", () => {
                _owner.model.active = "false";
                expect(deepEqual(_owner.model, _d)).toBe(true);
            });
        });
    });

    describe("Nested PropertiesModel Tests", () => {
        let _owner;
        beforeEach(() => {
            _owner = new Model({schemas: [nestedModel]});
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(_owner.model.$model).toBeDefined();
                expect(_owner.model.$model instanceof PropertiesModel).toBe(true);
                expect(_owner.model.$model).toBeDefined();
                expect(_owner.model.$model instanceof PropertiesModel).toBe(true);
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

                _owner.model = _d;
                expect(deepEqual(_owner.model, _d)).toBe(true);
                expect(_owner.model.aObject.bObject.$model).toBeDefined();
                expect(_owner.model.aObject.bObject.$model instanceof PropertiesModel).toBe(true)
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = {
                    aObject: {
                        bObject: {
                            bValue: "1234",
                        },
                    },
                };

                _owner.model = _d;
                expect(deepEqual(_owner.model, {})).toBe(true);
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

                _owner.model = _d;

                _d = {
                    bValue: 4321,
                };

                _owner.model.aObject.bObject = _d;
                expect(_owner.errors).toBe(null);
                expect(deepEqual(_owner.model.aObject.bObject, _d)).toBe(true);
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
                _owner.model = _d;
                expect(_owner.model.extraObject.someValue).toBe("test");
                delete _owner.model.extraObject.someValue;
                expect(_owner.errors).toBe(null);
                expect(_owner.model.extraObject.someValue).toBe(void(0));
            });

            it("should prevent deletion of nested properties that are required", () => {
                _owner.model = _d;
                expect(_owner.model.aObject.bObject.bValue).toBe(1234);
                delete _owner.model.aObject.bObject.bValue;
                expect(typeof _owner.errors).toBe("object");
                expect(_owner.model.aObject.bObject.bValue).toBe(1234);
            });
        });
    });

    describe("Nested Defaults PropertiesModel Tests", () => {
        let _owner;
        beforeEach(() => {
            _owner = new Model({schemas: [nestedModelDefault]}, {ajvOptions: {useDefaults: true}});
        });

        it("should populate default values", () => {
            const _d = {
                aObject: {
                    bObject: {},
                },
            };

            _owner.model = _d;
            expect(_owner.model.aObject.bObject.bValue).toBe(123);
        });
    });

    describe("Pattern Properties", () => {
        let _owner;
        beforeEach(() => {
            _owner = new Model({schemas: [patternModel]}, {ajvOptions: {useDefaults: true}});
        });

        it("should allow pattern properties", () => {
            _owner.model["test"] = "foo";
            expect(`${_owner}`).toEqual("{}");
            _owner.model["name"] = "foo";
            expect(`${_owner}`).toEqual("{\"name\":\"foo\"}");
        });

        it("should accept multiple uses of patternProperty", () => {
            _owner.model["name"] = "foo";
            expect(`${_owner}`).toEqual("{\"name\":\"foo\"}");
            _owner.model["name"] = "bar";
            expect(`${_owner}`).toEqual("{\"name\":\"bar\"}");
        });

    });

    describe("Nested Pattern Properties", () => {
        let _owner;
        beforeEach(() => {
            _owner = new Model({schemas: [nestedPatternModel]}, {ajvOptions: {useDefaults: true}});
        });

        it("should allow nested pattern properties", () => {
            _owner.model = {name: "test", nested: {test1: {foo: "bar"}}};
            expect(`${_owner.model.nested.$model}`).toEqual("{\"test1\":{\"foo\":\"bar\"}}");
        });

        it("should accept multiple uses of patternProperty", () => {
            _owner.model = {name: "test", nested: {test1: {foo1: "bar1"}}};
            expect(`${_owner.model.nested.$model}`).toEqual("{\"test1\":{\"foo1\":\"bar1\"}}");
            _owner.model.nested["test2"] = {foo2: "bar2"};
            expect(`${_owner.model.nested.$model}`).toEqual("{\"test1\":{\"foo1\":\"bar1\"},\"test2\":{\"foo2\":\"bar2\"}}");
        });

        it("should reject subsequent invalid uses of patternProperty", () => {
            _owner.model = {name: "test", nested: {test1: {foo1: "bar1"}}};
            _owner.model.nested["test1"] = false;
            expect(_owner.errors === null).toBe(false);
            expect(`${_owner.errors[0].instancePath}`).toEqual("/test1");
            expect(`${_owner.errors[0].message}`).toEqual("must be object");
        });

    });
});
