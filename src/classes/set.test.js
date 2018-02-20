import {JSD} from "./jsd";
import {Schema} from "./schema";
import {Set} from "./set";

describe("Set Class Test Suite", function () {
    describe("Initialization Tests", function () {
        // it.only("should initialize without a type", function() {
        //     let _set = new Set("*", new JSD());
        //     expect(_set instanceof Set).toBe(true);
        // });

        it("should initialize with typeof <String>", function () {
            let _set = new Set("String", null, new JSD());
            expect(_set instanceof Set).toBe(true);
        });

        it("should initialize with typeof <Number>", function () {
            let _set = new Set("Number", null, new JSD());
            expect(_set instanceof Set).toBe(true);
        });

        it("should initialize with typeof <Object>", function () {
            let _set = new Set("Object", null, new JSD());
            expect(_set instanceof Set).toBe(true);
        });

        it("should initialize with special type " * "", function () {
            let _set = new Set("*", null, new JSD());
            expect(_set instanceof Set).toBe(true);
        });

        it("should not initialize with invalid type", function () {
            expect(() => {
                new Set("INVALID", null, new JSD())
            }).toThrow("type '<INVALID>' for schema element 'type' was invalid");
        });
    });

    describe("Validation Tests", function () {
        "use strict";
        it("should validate for Strings", function () {
            let _set = new Set("String", null, new JSD());
            _set.addItem(1);
            expect(_set.length).toEqual(0);
            _set.addItem("1");
            _set.model = ["1"];
            expect(_set.length).toEqual(1);
        });

        it("should validate for Numbers", function () {
            let _set = new Set("Number", null, new JSD());
            _set.addItem("1");
            expect(_set.length).toEqual(0);
            _set.addItem(1);
            expect(_set.length).toEqual(1);
        });

        it("should validate for Objects", function () {
            const _schema = {
                type: "Object",
                elements: {
                    value: {
                        type: "String",
                        required: true,
                    }
                },
            };
            let _set = new Set(_schema, null, new JSD());
            _set.model = [
                {value: "1234"},
            ];
            expect(_set.length).toEqual(1);
        });
    });

    describe("Method Tests", function () {
        "use strict";
        let _set = new Set("*", null, new JSD());
        it("should add items with addItems", function () {
            _set.addItem("A String");
            expect(_set.length).toEqual(1);
        });

        it("should get an item with getItemAt", function () {
            expect(_set.getItemAt(0)).toEqual("A String");
        });

        it("should replace items with replaceItemAt", function () {
            _set.replaceItemAt(0, "New String");
            expect(_set.length).toEqual(1);
            expect(_set.getItemAt(0)).toEqual("New String");
        });

        it("should remove items with removeItemAt", function () {
            _set.removeItemAt(0);
            expect(_set.length).toEqual(0);
        });

        it("should push items with push", function () {
            _set.push("one potato", "two potato", "three potato", "four");
            expect(_set.length).toEqual(4);
        });

        it("should remove and return the first item from the list with shift", function () {
            let _val = _set.shift();
            expect(_val).toEqual("one potato");
            expect(_set.length).toEqual(3);
        });

        it("should remove and return the last item from the list with pop", function () {
            let _val = _set.pop();
            expect(_val).toEqual("four");
            expect(_set.length).toEqual(2);
        });

        it("should insert items to the beginning of the list with unshift", function () {
            _set.unshift("four potato", "five potato");
            expect(_set.model[1]).toEqual("five potato");
            expect(_set.length).toEqual(4);
        });
        it("should reset list to an empty array with reset", function () {
            _set.reset();
            expect(_set.length).toEqual(0);
        });
    });

    describe("rxjs tests", () => {
        it("should subscribe observers", (done) => {
            let _set = new Set("Number", null, new JSD());
            _set.subscribe({
                next: (v) => {
                    expect(v.length).toEqual(1);
                    expect(v[0]).toEqual(123);
                },
                error: (e) => {
                    expect(e).toEqual("'' expected number, type was '<string>'");
                    done()
                }
            });
            _set.addItem(123);
            _set.addItem("fail");
        });
    });

});