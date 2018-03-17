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
            let _set = new JSD([{type: "String"}]);
            expect(_set.document instanceof Set).toBe(true);
        });

        it("should initialize with typeof <Number>", function () {
            let _set = new JSD([{type: "Number"}]);
            expect(_set.document instanceof Set).toBe(true);
        });

        it("should initialize with typeof <Object>", function () {
            let _set = new JSD([{type: "String"}]);
            expect(_set.document instanceof Set).toBe(true);
        });

        it("should initialize with special type " * "", function () {
            let _set = new JSD([{type: "*"}]);
            expect(_set.document instanceof Set).toBe(true);
        });

        it("should not initialize with invalid type", function () {
            expect(() => {
                new Set("INVALID", null, new JSD())
            }).toThrow("type '<INVALID>' for schema element 'polymorphic' was invalid");
        });
    });

    describe("Validation Tests", function () {
        "use strict";
        it("should validate for Strings", function () {
            let _set = new JSD([{type: "String"}]);
            _set.document.addItem(1);
            _set.document.addItem("1");
            expect(_set.document.model.length).toEqual(1);
        });

        it("should validate for Numbers", function () {
            let _set = new JSD([{type: "Number"}]);
            _set.document.addItem("1");
            expect(_set.document.model.length).toEqual(0);
            _set.document.addItem(1);
            expect(_set.document.model.length).toEqual(1);
        });

        it("should validate for Objects", function () {
            const _schema = [{
                type: "Object",
                elements: {
                    value: {
                        type: "String",
                        required: true,
                    }
                }
            }];
            let _set = new JSD(_schema);
            _set.document.model = [
                {value: 1234},
            ];
            expect(_set.document.model.length).toEqual(0);
            _set.document.model = [
                {value: "1234"},
            ];
            expect(_set.document.model.length).toEqual(1);
        });
    });

    describe("Method Tests", function () {
        "use strict";
        let _set = new JSD([{type: "*"}]);
        it("should add items with addItems", function () {
            _set.document.addItem("A String");
            expect(_set.document.model.length).toEqual(1);
        });

        it("should get an item with getItemAt", function () {
            expect(_set.document.getItemAt(0)).toEqual("A String");
        });

        it("should replace items with replaceItemAt", function () {
            _set.document.replaceItemAt(0, "New String");
            expect(_set.document.model.length).toEqual(1);
            expect(_set.document.getItemAt(0)).toEqual("New String");
        });

        it("should remove items with removeItemAt", function () {
            _set.document.removeItemAt(0);
            expect(_set.document.model.length).toEqual(0);
        });

        it("should push items with push", function () {
            _set.document.push("one potato", "two potato", "three potato", "four");
            expect(_set.document.model.length).toEqual(4);
        });

        it("should remove and return the first item from the list with shift", function () {
            let _val = _set.document.shift();
            expect(_val).toEqual("one potato");
            expect(_set.document.model.length).toEqual(3);
        });

        it("should remove and return the last item from the list with pop", function () {
            let _val = _set.document.pop();
            expect(_val).toEqual("four");
            expect(_set.document.model.length).toEqual(2);
        });

        it("should insert items to the beginning of the list with unshift", function () {
            _set.document.unshift("four potato", "five potato");
            expect(_set.document.model[1]).toEqual("five potato");
            expect(_set.document.model.length).toEqual(4);
        });
        it("should reset list to an empty array with reset", function () {
            _set.document.reset();
            expect(_set.document.model.length).toEqual(0);
        });
    });

    describe("rxjs tests", () => {
        it("should subscribe observers", (done) => {
            let _set = new JSD([{type: "Number"}]);
            _set.document.subscribe({
                next: (v) => {
                    expect(v.model.length).toEqual(1);
                    expect(v.model[0]).toEqual(123);
                },
                error: (e) => {
                    expect(e).toEqual("'.*' expected number, type was '<string>'");
                    done()
                }
            });
            _set.document.addItem(123);
            _set.document.addItem("fail");
        });
    });

    describe("wildcard types and keys", () => {
        it("should support wildcard keys", (done) => {
            const _schema = [{
                type: "Object",
                elements: {
                    "*": {
                        type: "Number",
                    },
                },
            }];
            const _h = {
                next: (schema) => {
                    console.log(`${schema}`);
                    expect(schema.model[0].valueA).toBe(1);
                    expect(schema.model[1].valueB).toBe(2);
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    done();
                },
                error: (e) => {
                    done(`error: ${e}`);
                },
            };
            const _jsd = new JSD(_schema);
            _jsd.document.subscribe(_h);
            _jsd.document.model = [
                {valueA: 1},
                {valueB: 2},
                // {valueC: {
                //         subEl: "foo",
                //         subObj: {
                //             subEl: "bar"
                //         }
                //     }
                // }
            ];
        });
        it("should support wildcard types", (done) => {
            const _schema = [{
                type: "Object",
                elements: {
                    "value": {
                        type: "*",
                    },
                },
            }];
            const _h = {
                next: (schema) => {
                    console.log(`${schema}`);
                    expect(schema.model[0].value).toBe(1);
                    expect(schema.model[1].value).toBe("2");
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    done();
                },
                error: (e) => {
                    done(`error: ${e}`);
                },
            };
            const _jsd = new JSD(_schema);
            _jsd.document.subscribe(_h);
            _jsd.document.model = [
                {value: 1},
                {value: "2"},

            ];
        });

        it("should support wildcard keys and types", (done) => {
            const _schema = [{
                type: "Object",
                elements: {
                    "*": {
                        type: "*",
                    },
                }
            }];
            const _h = {
                next: (schema) => {
                    console.log(`${schema}`);
                    expect(schema.model[0].valueA).toBe(1);
                    expect(schema.model[1].valueB).toBe("2");
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    done();
                },
                error: (e) => {
                    done(`error: ${e}`);
                },
            };
            const _jsd = new JSD(_schema);
            _jsd.document.subscribe(_h);
            _jsd.document.model = [
                {valueA: 1},
                {valueB: "2"},

            ];
        });
    });

    describe("back ref", () => {
        it("should provide backref on model", (done) => {
            const _jsd = new JSD([{
                type: "Object",
                elements: {
                    value: {
                        type: "Object",
                        elements: {
                            subEl: {
                                type: "String",
                            },
                            subObj: {
                                type: "Object",
                                elements: {
                                    subEl: {
                                        type: "String",
                                    },
                                },
                            },
                        },
                    },
                },
            }, {
                type: "Object",
                elements: {
                    value: {
                        type: "Number",
                    },
                },
            }]);
            let cnt = 0;

            const _h = {
                next: (schema) => {
                    console.log(`${schema}`);
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[0].value).toBe(1);
                    expect(schema.model[1].value).toBe(2);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    expect(typeof schema.model[2].value).toBe("object");
                    expect(schema.model[2].$ref instanceof Schema).toBe(true);
                    expect(schema.model[2].value.subEl).toBe("foo");
                    expect(typeof schema.model[2].value.subObj).toBe("object");
                    expect(schema.model[2].value.subObj.subEl).toBe("bar");
                    expect(schema.model[2].value.hasOwnProperty('$ref')).toBe(true);
                    expect(schema.model[2].value.subObj.hasOwnProperty('$ref')).toBe(true);
                    done();
                },
                error: (e) => {
                    done(`error: ${e}`);
                },
            };
            _jsd.document.subscribe(_h);
            _jsd.document.model = [
                {value: 1},
                {value: 2},
                {
                    value: {
                        subEl: "foo",
                        subObj: {
                            subEl: "bar"
                        }
                    }
                }
            ];
        });
    });
});