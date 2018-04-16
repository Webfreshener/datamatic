import {JSD} from "./jsd";
import {default as deepEqual} from "deep-equal";
import {
    stringsCollection,
    stringsMinMaxCollection,
    objectCollection
} from "../../fixtures/ItemsModel.schemas";
import {Model} from "./model";

describe("Set Class Suite", function () {

    describe("Simple Set Tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(stringsCollection);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof Model).toBe(true);
                expect(Array.isArray(this.jsd.document.model)).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof Model).toBe(true);
            });

            it("should not initialize a invalid schema and schema object", () => {
                let badSchema = Object.assign({}, stringsCollection, {
                    items: [{type: "INVALID"}],
                });
                expect(() => new JSD(badSchema)).toThrow();
            });
        });

        describe("LifeCycle: Creation", () => {

            let _d;

            it("should populate with valid data and make that data accessible", () => {
                _d = ["abc", "def", "ghi"];

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, _d)).toBe(true);
            });

            it("should reject invalid data and leave model pristine", () => {
                _d = [99, 100, 101];

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, {})).toBe(true);
            });
        });
    });

    describe("Nested Elements Tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(objectCollection);
        });

        describe("LifeCycle: Instantiation", () => {
            it("should initialize a valid schema and a schema object", () => {
                expect(this.jsd.document).toBeDefined();
                expect(this.jsd.document instanceof Model).toBe(true);
                expect(this.jsd.document.model.$ref).toBeDefined();
                expect(this.jsd.document.model.$ref instanceof Model).toBe(true);
            });
        });

        describe("LifeCycle: Create", () => {

            let _d;

            it("should populate with valid data and make that data accessible", () => {
                _d = [{
                    name: "Item A",
                    value: 1,
                }, {
                    name: "Item B",
                }, {
                    name: "Item C",
                    value: 2,
                }];

                this.jsd.document.model = _d;
                expect(deepEqual(this.jsd.document.model, _d)).toBe(true);
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

                this.jsd.document.model = _d;
                expect(typeof this.jsd.errors).toBe("object");
                expect(deepEqual(this.jsd.document.model, [])).toBe(true);
            });
        });

        describe("LifeCycle: Update", () => {

            let _d;

            it("should updated nested item objects with valid data and pass validation", () => {
                _d = [{
                    name: "Item A",
                    value: 1,
                }, {
                    name: "Item B",
                }, {
                    name: "Item C",
                    value: 2,
                }];

                this.jsd.document.model = _d;

                this.jsd.document.model[1] = {
                    name: "Item B",
                    value: 3
                };

                expect(this.jsd.errors).toBe(null);
                expect(this.jsd.document.model[1]).toEqual({name: "Item B", value: 3});
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

                this.jsd.document.model = _d;

                this.jsd.document.model[1].value = 3;


                expect(this.jsd.errors).toBe(null);
                expect(this.jsd.document.model[1]).toEqual({name: "Item B", value: 3});
            });
        });

        describe("LifeCycle: Delete", () => {
            beforeEach(() => {
                this.jsd = new JSD(stringsMinMaxCollection);
            });

            _d = ["Item A", "Item B", "Item C"];

            it("should allow deletion of nested properties that are not required", () => {
                this.jsd.document.model = _d;
                delete this.jsd.document.model[1];
                expect(this.jsd.errors).toBe(null);
                expect(this.jsd.document.model.length).toBe(2);
            });

            it("should prevent deletion of nested properties that are required", () => {
                this.jsd.document.model = _d;
                delete this.jsd.document.model[0];
                delete this.jsd.document.model[1];
                delete this.jsd.document.model[2];
                expect(typeof this.jsd.errors).toBe("object");
                expect(this.jsd.document.model.length).toBe(1);
            });
        });
    });

    describe.only("Array Prototype method tests", () => {
        beforeEach(() => {
            this.jsd = new JSD(stringsMinMaxCollection);
        });

        it("should pop with validation", () => {
            this.jsd.document.model = ["Item A", "Item B", "Item C"];
            this.jsd.document.model.pop();
            this.jsd.document.model.pop();
            this.jsd.document.model.pop();
            expect(typeof this.jsd.errors).toBe("object");
            expect(this.jsd.document.model.length).toBe(1);
        });

        it("should push with validation", () => {
            this.jsd.document.model = ["Item A", "Item B", "Item C"];
            this.jsd.document.model.push("Item D");
            expect(typeof this.jsd.errors).toBe("object");
            expect(this.jsd.document.model.length).toBe(3);
            expect(this.jsd.document.model[2]).toBe("Item C");
        });

        it("should shift with validation", () => {
            this.jsd.document.model = ["Item A", "Item B", "Item C"];
            this.jsd.document.model.shift();
            this.jsd.document.model.shift();
            this.jsd.document.model.shift();
            expect(typeof this.jsd.errors).toBe("object");
            expect(this.jsd.document.model.length).toBe(1);
        });

        it("should splice with validation", () => {
            this.jsd.document.model = ["Item A", "Item B", "Item C"];
            // remove all..
            this.jsd.document.model.splice(0, -1);
            expect(typeof this.jsd.errors).toBe("object");
            expect(this.jsd.document.model.length).toBe(3);
            // append element...
            this.jsd.document.model.splice(-1, 0, "Item D");
            expect(typeof this.jsd.errors).toBe("object");
            expect(this.jsd.document.model.length).toBe(3);
        });
    })
});
