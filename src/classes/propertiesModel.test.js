import {PropertiesModel} from "./propertiesModel";
import {RxVO} from "./rxvo";
import {default as deepEqual} from "deep-equal";
import {
    basicModel, nestedModel, nestedModelDefault, nestedPatternModel, patternModel
} from "../../fixtures/PropertiesModel.schemas";

describe("PropertiesModel Class Suite", function () {

    describe("Simple PropertiesModel Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO({schemas: [basicModel]});
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
                expect(() => new RxVO({schemas: [badSchema]})).toThrow();
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
                const _sub = this.rxvo.subscribe({
                    error: (e) => console.log(JSON.stringify(e)),
                });
                this.rxvo.model.active = "false";
                expect(deepEqual(this.rxvo.model, _d)).toBe(true);
            });
        });
    });

    describe("Nested PropertiesModel Tests", () => {
        let _rxvo;
        beforeEach(() => {
            _rxvo = new RxVO({schemas: [nestedModel]});
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
            _rxvo = new RxVO({schemas: [nestedModelDefault]}, {ajvOptions: {useDefaults: true}});
        });

        it("should populate default values", () => {
            const _d = {
                aObject: {
                    bObject: {},
                },
            };

            _rxvo.model = _d;
            expect(_rxvo.model.aObject.bObject.bValue).toBe(123);
        });
    });

    describe("Pattern Properties", () => {
        let _rxvo;
        beforeEach(() => {
            _rxvo = new RxVO({schemas: [patternModel]}, {ajvOptions: {useDefaults: true}});
        });

        it("should allow pattern properties", () => {
            _rxvo.model["test"] = "foo";
            expect(`${_rxvo}`).toEqual("{}");
            _rxvo.model["name"] = "foo";
            expect(`${_rxvo}`).toEqual("{\"name\":\"foo\"}");
        });

        it("should accept multiple uses of patternProperty", () => {
            _rxvo.model["name"] = "foo";
            expect(`${_rxvo}`).toEqual("{\"name\":\"foo\"}");
            _rxvo.model["name"] = "bar";
            expect(`${_rxvo}`).toEqual("{\"name\":\"bar\"}");
        });

    });

    describe("Nested Pattern Properties", () => {
        let _rxvo;
        beforeEach(() => {
            _rxvo = new RxVO({schemas: [nestedPatternModel]}, {ajvOptions: {useDefaults: true}});
        });

        it("should allow nested pattern properties", () => {
            _rxvo.model = {name: "test", nested: {test1: {foo: "bar"}}};
            expect(`${_rxvo.model.nested.$model}`).toEqual("{\"test1\":{\"foo\":\"bar\"}}");
        });

        it("should accept multiple uses of patternProperty", () => {
            _rxvo.model = {name: "test", nested: {test1: {foo1: "bar1"}}};
            expect(`${_rxvo.model.nested.$model}`).toEqual("{\"test1\":{\"foo1\":\"bar1\"}}");
            _rxvo.model.nested["test2"] = {foo2: "bar2"};
            expect(`${_rxvo.model.nested.$model}`).toEqual("{\"test1\":{\"foo1\":\"bar1\"},\"test2\":{\"foo2\":\"bar2\"}}");
        });

        it("should reject subsequent invalid uses of patternProperty", () => {
            _rxvo.model = {name: "test", nested: {test1: {foo1: "bar1"}}};
            _rxvo.model.nested["test1"] = false;
            expect(_rxvo.errors === null).toBe(false);
            expect(`${_rxvo.errors[0].dataPath}`).toEqual("/test1");
            expect(`${_rxvo.errors[0].message}`).toEqual("should be object");
        });

    });
});
