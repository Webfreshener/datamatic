import {JSD} from "./jsd";
import {Schema} from "./schema";
import {Set} from "./set";
import {_vBuilders} from "./_references";

describe("Set Class Test Suite", function () {
    describe("Initialization Tests", function () {
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
                new Set("INVALID", null, new JSD("INVALID"));
            }).toThrow("Schema was invalid. JSON object or formatted string is required");
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
                    expect(e).toEqual("'*.polymorphic.0' expected number, type was '<string>'");
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
                    expect(schema.model[0].valueA).toBe(1);
                    expect(schema.model[1].valueB).toBe(2);
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    done();
                },
                error: (e) => {
                    done(e);
                },
            };
            const _jsd = new JSD(_schema);
            _jsd.document.subscribe(_h);
            _jsd.document.model = [
                {valueA: 1},
                {valueB: 2},
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

    describe("Nested Element", () => {
        it("should support being nested in other elements", (done) => {
            const _jsd = new JSD({
                aString: {
                    type: "String",
                },
                anArray: {
                    type: "Array",
                    required: true,
                    elements: [{
                        type: "Number",
                    }],
                },
            });
            _jsd.document.subscribe({
                next: (val) => {
                    expect(_jsd.document.model.anArray.length).toBe(3);
                    done();
                },
                error: (e) => {
                    done(e);
                }
            });
            _jsd.document.model = {
                aString: "foo",
                anArray: [1, 2, 3],
            };

        });
    });

    describe("Polymorphic Elements", () => {
        it("should allow for multiple types of elements", (done) => {
            const _jsd = new JSD([{
                type: "Object",
                elements: {
                    value: {
                        type: "Number",
                    },
                },
            }, {
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
            },]);
            let cnt = 0;
            const _h = {
                next: (schema) => {
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[0].value).toBe(1);
                    expect(schema.model[1].value).toBe(2);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
                    expect(typeof schema.model[2].value).toBe("object");
                    expect(schema.model[2].$ref instanceof Schema).toBe(true);
                    expect(schema.model[2].value.subEl).toBe("foo");
                    expect(typeof schema.model[2].value.subObj).toBe("object");
                    expect(schema.model[2].value.subObj.subEl).toBe("bar");
                    expect(schema.model[2].value.hasOwnProperty("$ref")).toBe(true);
                    expect(schema.model[2].value.subObj.hasOwnProperty("$ref")).toBe(true);
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
                },
            ];
        });
    });

    describe("back ref", () => {
        it("should provide backref on model", (done) => {
            const _jsd = new JSD([{
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
                    console.log(_vBuilders.get(_jsd).list());
                    console.log(schema.validate());
                    console.log(`${schema}`);
                    expect(schema.model[0].$ref instanceof Schema).toBe(true);
                    expect(schema.model[0].value).toBe(1);
                    expect(schema.model[1].value).toBe(2);
                    expect(schema.model[1].$ref instanceof Schema).toBe(true);
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
            ];
        });
    });

    describe("long arrays", () => {
        it("should handle array", (done) => {
            let list = [{
                name: "Alice",
                value: 1,
            }, {
                name: "Bob",
                value: 2,
            }, {
                name: "Charlie",
                value: 3,
            }, {
                name: "Dave",
                value: 4,
            }, {
                name: "Ed",
                value: 5,
            }, {
                name: "Frank",
                value: 6,
            }, {
                name: "Gary",
                value: 7,
            }, {
                name: "Helen",
                value: 8,
            }, {
                name: "Ike",
                value: 9,
            }, {
                name: "Janet",
                value: 10,
            }, {
                name: "Kim",
                value: 11,
            }];

            const _jsd = new JSD([{
                type: "Object",
                elements: {
                    name: {
                        type: "String",
                    },
                    value: {
                        type: "Number",
                    },
                },
            }]);

            _jsd.document.subscribe({
                next: (doc) => {
                    expect(doc.length).toBe(11);
                    done()
                },
                error: (e) => {
                    done(e);
                },
            });

            _jsd.document.model = list;
        });
    });
});