import {RxVO} from "./rxvo";
import {default as deepEqual} from "deep-equal";
import {
    stringsCollection,
    stringsMinMaxCollection,
    objectCollection, objectCollectionDefaults
} from "../../fixtures/ItemsModel.schemas";
import {Model} from "./model";

describe("ItemsModel Class Suite", function () {

    describe("Simple ItemsModel Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO({schemas: [stringsCollection]});
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.rxvo.model.$model).toBeDefined();
                expect(this.rxvo.model.$model instanceof Model).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, stringsCollection, {
                    items: [{type: "INVALID"}],
                });
                expect(() => new RxVO({schemas: [badSchema]})).toThrow();
            });
        });

        describe("ItemsModel LifeCycle: Creation", () => {

            let _d;

            it("should populate with valid data and make that data accessible", (done) => {
                _d = ["abc", "def", "ghi"];
                let _cnt = -1;

                this.rxvo.subscribe({
                    next: (m) => {
                        _cnt++;
                        expect(deepEqual(this.rxvo.model, _d)).toBe(true);
                    },
                    error: done,
                });

                setTimeout(() => {
                    if (_cnt) {
                        done("ItemsModel fired more than once for a single operation");
                    } else {
                        if (_cnt < 0) {
                            done("ItemsModel did not fire");
                        } else {
                            console.log(`_cnt: ${_cnt}`);
                            done();
                        }
                    }
                }, 100);

                this.rxvo.model = _d;
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = [99, 100, 101];

                this.rxvo.model = _d;
                expect(deepEqual(this.rxvo.model, {})).toBe(true);
            });
        });
    });

    describe("Nested Elements Tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO({schemas: [objectCollection]});
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(this.rxvo.model.$model).toBeDefined();
                expect(this.rxvo.model.$model instanceof Model).toBe(true);
                expect(this.rxvo.model.$model).toBeDefined();
                expect(this.rxvo.model.$model instanceof Model).toBe(true);
            });
        });

        describe("ItemsModel LifeCycle: Nested Create", () => {

            let _d;

            it.only("should populate with valid data and make that data accessible", (done) => {
                _d = [{
                    name: "Item A",
                    value: 1,
                }, {
                    name: "Item B",
                }, {
                    name: "Item C",
                    value: 2,
                }];

                let _cnt = -1;

                this.rxvo.subscribe({
                    next: (m) => {
                        _cnt++;
                        expect(deepEqual(this.rxvo.model, _d)).toBe(true);
                    },
                    error: done,
                });

                setTimeout(() => {
                    if (_cnt) {
                        done("ItemsModel fired more than once for a single operation");
                    } else {
                        if (_cnt < 0) {
                            done("ItemsModel did not fire");
                        } else {
                            console.log(`_cnt: ${_cnt}`);
                            done();
                        }
                    }
                }, 100);

                this.rxvo.model = _d;
                // expect(deepEqual(this.rxvo.model, _d)).toBe(true);
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = [{
                    name: 123,
                    value: 1,
                }, {
                    value: "Item B",
                }, {
                    value: 2,
                }];

                this.rxvo.model = _d;
                expect(typeof this.rxvo.errors).toBe("object");
                expect(deepEqual(this.rxvo.model, [])).toBe(true);
            });
        });

        describe("LifeCycle: Update", () => {

            let _d;

            it("should update nested models with valid data and pass validation", () => {
                _d = [{
                    name: "Item A",
                    value: 1,
                }, {
                    name: "Item B",
                }, {
                    name: "Item C",
                    value: 2,
                }];

                this.rxvo.model = _d;

                this.rxvo.model[1] = {
                    name: "Item B",
                    value: 3
                };

                expect(this.rxvo.errors).toBe(null);
                expect(this.rxvo.model[1]).toEqual({name: "Item B", value: 3});
            });

            it("should updated properties in nested objects with valid data and pass validation", () => {
                _d = [{
                    name: "Item A",
                    value: 1,
                }, {
                    name: "Item B",
                }, {
                    name: "Item C",
                    value: 2,
                }];

                this.rxvo.model = _d;

                this.rxvo.model[1].value = 3;


                expect(this.rxvo.errors).toBe(null);
                expect(this.rxvo.model[1]).toEqual({name: "Item B", value: 3});
            });
        });

        describe("LifeCycle: Delete", () => {
            beforeEach(() => {
                this.rxvo = new RxVO({schemas: [stringsMinMaxCollection]});
            });

            let _d = ["Item A", "Item B", "Item C"];

            it("should allow deletion of nested properties that are not required", () => {
                this.rxvo.model = _d;
                delete this.rxvo.model[1];
                expect(this.rxvo.errors).toBe(null);
                expect(this.rxvo.model.length).toBe(2);
            });

            it("should prevent deletion of nested properties that are required", () => {
                this.rxvo.model = _d;
                delete this.rxvo.model[0];
                delete this.rxvo.model[1];
                delete this.rxvo.model[2];
                expect(typeof this.rxvo.errors).toBe("object");
                expect(this.rxvo.model.length).toBe(1);
            });
        });
    });

    describe("Array Prototype method tests", () => {
        beforeEach(() => {
            this.rxvo = new RxVO({schemas: [stringsMinMaxCollection]});
            this.rxvo.model = ["Item A", "Item B", "Item C"];
        });

        it("should fill with validation", () => {
            this.rxvo.model.fill(["Item A", "Item B", "Item C", "Item D"]);
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(3);
        });

        it("should pop with validation", () => {
            this.rxvo.model.pop();
            this.rxvo.model.pop();
            this.rxvo.model.pop();
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(1);
        });

        it("should push with validation", () => {
            this.rxvo.model.push("Item D");
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(3);
            expect(this.rxvo.model[2]).toBe("Item C");
        });

        it("should shift with validation", () => {
            this.rxvo.model.shift();
            this.rxvo.model.shift();
            this.rxvo.model.shift();
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(1);
        });

        it("should splice with validation", () => {
            // remove all..
            this.rxvo.model.splice(0, -1);
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(3);
            // append element...
            this.rxvo.model.splice(-1, 0, "Item D");
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(3);
        });

        it("should unshift with validation", () => {
            this.rxvo.model.unshift("Item Z");
            expect(typeof this.rxvo.errors).toBe("object");
            expect(this.rxvo.model.length).toBe(3);
        });
    });

    describe("Default Values", () => {
        it("should apply defaults to items", () => {
            this.rxvo = new RxVO({schemas: [objectCollectionDefaults]}, {ajvOptions: {useDefaults: true}});
            this.rxvo.model = [{}];
            expect(this.rxvo.model[0]).toEqual({name: "abc"});
        });
    });

    describe("Model Class methods ", () => {

        it("should not reset if it would invalidate model", () => {
            const _rxvo = new RxVO({schemas: [stringsMinMaxCollection]});
            _rxvo.model = ["Item A", "Item B", "Item C"];
            expect(_rxvo.model.length).toBe(3);
            _rxvo.model.$model.reset();
            expect(_rxvo.model.length).toBe(3);
        });

        it("should reset it's collection if allowed", () => {
            const _rxvo = new RxVO({schemas: [stringsCollection]});
            _rxvo.model = ["Item A", "Item B", "Item C"];
            _rxvo.model = ["Item A", "Item B", "Item C"];
            expect(_rxvo.model.length).toBe(3);
            _rxvo.model.$model.reset();
            expect(_rxvo.model.length).toBe(0);
        });

        it("should quietly validate data with the validate method", () => {
            const _rxvo = new RxVO({schemas: [stringsCollection]});
            expect(_rxvo.model.$model.validate([1, 2, 3])).toBe("data/0 should be string");
            expect(_rxvo.model.$model.validate(["1", "2", "3"])).toBe(true);
        });

        it("should freeze it's model", () => {
            const _rxvo = new RxVO({schemas: [stringsCollection]});
            _rxvo.model = ["Item A", "Item B", "Item C"];
            _rxvo.model.$model.freeze();
            expect(_rxvo.model.$model.isFrozen).toBe(true);
            _rxvo.model = ["1", "2", "3"];
            expect(deepEqual(_rxvo.model, ["Item A", "Item B", "Item C"])).toBe(true);
        });

        it("should freeze it's model hierarchy", () => {
            const _rxvo = new RxVO({schemas: [objectCollection]});
            const _orig = [{
                name: "My Name",
                active: true,
            }];

            _rxvo.model = _orig;
            _rxvo.model.$model.freeze();

            expect(_rxvo.model.$model.isFrozen).toBe(true);
            // should not allow array to be overriden
            _rxvo.model = [{
                name: "Your Name",
                active: false,
            }];
            expect(deepEqual(_rxvo.model, _orig)).toBe(true);
            // should not allow array item to be overriden
            _rxvo.model[0] = {
                name: "Your Name",
                active: false,
            };
            expect(deepEqual(_rxvo.model, _orig)).toBe(true);
            // should not set attributes on nested object properties
            _rxvo.model[0].name = "Other Name";
            expect(deepEqual(_rxvo.model, _orig)).toBe(true);
        });
    });
});
