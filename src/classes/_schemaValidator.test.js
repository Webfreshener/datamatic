import {_vBuilders} from "./_references";
import {SchemaValidator} from "./_schemaValidator";
import {JSD} from "./jsd";

describe("SchemaValidator Class Tests", () => {
    describe("TYPE checking", () => {
        it("should fail invalid TYPES", () => {
            const _s = {
                array: {
                    type: "Array",
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
                },
            };
            let _e = "value for schema element 'boolean' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
        });
        it("should pass valid TYPES", () => {
            let _s = {
                array: {
                    type: "Array",
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
                },
            };
            let _sV = new SchemaValidator(_s, {jsd: new JSD(_s)});
            expect(_sV.isValid).toBe(true);
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
    describe.skip("Array Elements", () => {
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
            let _e = "value for schema element '.*.subObj.subEl' has invalid type '<BOGUS>'";
            expect(() => new SchemaValidator(_s, {jsd: new JSD(_s)})).toThrow(_e);
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
            let _sV = new SchemaValidator(_s, {jsd: _jsd});
            expect(_sV.isValid).toBe(true);
            expect(_vBuilders.get(_jsd).list().length).toBe(3);
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
                                type: "String",
                            }, {
                                type: "Array",
                                elements: {
                                    type: "Object",
                                    elements: {
                                        name: {
                                            type: "BOGUS",
                                        },
                                    },
                                },
                            }],
                        },
                    },
                }],
            };
            let _e = "value for schema element 'polymorphic.1.subObj.polymorphic.1.name' has invalid type '<BOGUS>'";
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
                                type: "String",
                            }, {
                                type: "Array",
                                elements: {
                                    type: "Object",
                                    elements: {
                                        name: {
                                            type: "String",
                                        },
                                    },
                                },
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
