import {_vBuilders} from "./_references";
import {SchemaValidator} from "./_schemaValidator";
import {JSD} from "./jsd";

describe("SchemaValidator Class Tests", () => {
    describe("TYPE checking", () => {
        it("should fail invalid TYPES", () => {
            const _s = {
                array: {
                    type: "Array",
                    elements: {
                        type: "*"
                    },
                },
                boolean: {
                    type: "BOGUS",
                },
                number: {
                    type: "Number",
                },
                string: {
                    type: "String",
                },
                object: {
                    type: "Object",
                    elements: {
                        type: "*"
                    },
                },
            };
            let _e = "value for schema element 'boolean' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
        });
        it("should pass valid TYPES", () => {
            let _s = {
                array: {
                    type: "Array",
                    elements: {
                        type: "*"
                    },
                },
                boolean: {
                    type: "Boolean",
                },
                number: {
                    type: "Number",
                },
                string: {
                    type: "String",
                },
                object: {
                    type: "Object",
                    elements: {
                        type: "*"
                    },
                },
            };
            let _sV = new SchemaValidator(_s, {jsd: new JSD(_s)});
            expect(_sV.isValid).toBe(true);
        });
    });
    describe("Wildcard Keys", () => {
        it("should handle wildcard elements", () => {
            const _s = {
                "*": {
                    "type": "Object",
                    "elements": {
                        "type": {
                            "type": "String",
                            "required": true,
                            "restrict": "^(belongsTo|hasMany|hasManyThrough|hasAndBelongsToMany)+$"
                        },
                    },
                },
            };
            let _jsd = new JSD(_s);
            let list = _vBuilders.get(_jsd).list();
            expect(list.length).toBe(2);
            expect(list[0]).toBe("*");
            expect(list[1]).toBe("*.type");

        });
        it("should handle nested wildcard elements", () => {
            const _s = {
                "relations": {
                    "type": "Object",
                    "required": false,
                    "elements": {
                        "*": {
                            "type": "Object",
                            "elements": {
                                "type": {
                                    "type": "String",
                                    "required": true,
                                    "restrict": "^(belongsTo|hasMany|hasManyThrough|hasAndBelongsToMany)+$"
                                },
                            },
                        },
                    },
                },
            };
            let _jsd = new JSD(_s);
            let list = _vBuilders.get(_jsd).list();
            expect(list.length).toBe(3);
            expect(list[0]).toBe("relations");
            expect(list[1]).toBe("relations.*");
            expect(list[2]).toBe("relations.*.type");
        });
        it("should handle nested wildcard schema", () => {
            const _s = require("../../fixtures/wildcard.schema.json");
            let _jsd = new JSD(_s);
            let list = _vBuilders.get(_jsd).list();
            expect(list.length).toBe(6);
            expect(list[0]).toBe("*");
            expect(list[1]).toBe("*.*");
            expect(list[2]).toBe("*.*.name");
            expect(list[3]).toBe("*.*.*.polymorphic.0");
            expect(list[4]).toBe("*.*.*.polymorphic.1");
            expect(list[5]).toBe("*.*.*.polymorphic.2");
        });
    });
    describe("Nested Elements", () => {
        it("should FAIL if invalid types are found in nested elements", () => {
            const _s = {
                root: {
                    type: "Object",
                    elements: {
                        subObj: {
                            type: "Object",
                            elements: {
                                subEl: {
                                    type: "BOGUS",
                                }
                            }
                        }
                    }
                },
            };
            let _e = "value for schema element 'root.subObj.subEl' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
        });
        it("should traverse nested elements", () => {
            const _s = {
                root: {
                    type: "Object",
                    elements: {
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
            };
            let _sV = new SchemaValidator(_s, {jsd: new JSD(_s)});
            expect(_sV.isValid).toBe(true);
        });
    });
    describe("Array Elements", () => {
        it("should FAIL if invalid types are found in Arrays", () => {
            const _s = [{
                type: "Object",
                elements: {
                    subObj: {
                        type: "Object",
                        elements: {
                            subEl: {
                                type: "BOGUS",
                            },
                        }
                    }
                },
            }];
            let _e = "value for schema element '*.polymorphic.0.subObj.subEl' has invalid type '<BOGUS>'";
            // expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
            expect(() => new JSD(_s)).toThrow(_e);

        });
        it("should SUCCEED if valid types are found in Arrays", () => {
            const _s = [{
                type: "Object",
                elements: {
                    subObj: {
                        type: "Object",
                        elements: {
                            subEl: {
                                type: "String",
                            },
                        }
                    }
                },
            }];
            let _jsd = new JSD(_s);
            let list = _vBuilders.get(_jsd).list();
            expect(list.length).toBe(3);
            expect(list[0]).toBe("*.polymorphic.0");
            expect(list[1]).toBe("*.polymorphic.0.subObj");
            expect(list[2]).toBe("*.polymorphic.0.subObj.subEl");
        });
        it("should SUCCEED if valid types are found in Nested Arrays", () => {
            const _s = {
                subObj: {
                    type: "Object",
                    elements: {
                        subEl: {
                            type: "Array",
                            elements: {
                                type: "String",
                            }
                        },
                    },
                },
            };
            let _jsd = new JSD(_s);
            let list = _vBuilders.get(_jsd).list();
            expect(list.length).toBe(2);
            expect(list[0]).toBe("subObj");
            expect(list[1]).toBe("subObj.subEl.*.polymorphic.0");
        });
    });
    describe("Polymorphic Elements", () => {
        it("should FAIL if invalid types are found in nested elements", () => {
            const _s = {
                polymorphic: [{
                    type: "Boolean",
                }, {
                    type: "Object",
                    elements: {
                        subObj: {
                            type: "Object",
                            elements: {
                                subEl: {
                                    type: "BOGUS",
                                },
                            },
                        },
                    },
                }],
            };
            let _e = "value for schema element 'polymorphic.1.subObj.subEl' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
        });
        it("should SUCCEED if valid types are found in nested elements", () => {
            const _s = {
                polymorphic: [{
                    type: "Boolean",
                }, {
                    type: "Object",
                    elements: {
                        subObj: {
                            type: "Object",
                            elements: {
                                subEl: {
                                    type: "String",
                                },
                            },
                        },
                    },
                }],
            }
            let _sV = new SchemaValidator(_s, {jsd: new JSD(_s)});
            expect(_sV.isValid).toBe(true);
        });
    });
    describe("Nested Polymorphic Elements", () => {
        it("should FAIL if invalid types are found in nested elements", () => {
            const _s = {
                polymorphic: [{
                    type: "Boolean",
                }, {
                    type: "Object",
                    elements: {
                        subObj: {
                            polymorphic: [{
                                // type: "Array",
                                // elements: {
                                    type: "Object",
                                    elements: {
                                        name: {
                                            type: "BOGUS",
                                        },
                                    },
                                // },
                            }, {
                                type: "String",
                            }],
                        },
                    },
                }],
            };
            let _e = "value for schema element 'polymorphic.1.subObj.polymorphic.0.name' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
        });
        it("should SUCCEED if valid types are found in nested elements", () => {
            const _s = {
                polymorphic: [{
                    type: "Boolean",
                }, {
                    type: "Object",
                    elements: {
                        subObj: {
                            polymorphic: [{
                                type: "Array",
                                elements: {
                                    type: "Object",
                                    elements: {
                                        name: {
                                            type: "String",
                                        },
                                    },
                                },
                            }, {
                                type: "String",
                            }],
                        },
                    },
                }],
            };
            let _sV = new SchemaValidator(_s, {jsd: new JSD(_s)});
            expect(_sV.isValid).toBe(true);
        });
    });
});
