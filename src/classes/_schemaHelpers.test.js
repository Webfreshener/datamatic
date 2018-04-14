import {_schemaHelpers, _mdRef, _validPaths, _vBuilders, _validators} from "./_references";
import {Schema} from "./schema";
import {Set} from "./set";
import {JSD} from "./jsd";
import {MetaData} from "./_metaData";
import {SchemaHelpers} from "./_schemaHelpers";

describe("SchemaHelpers Class Tests", () => {
    const _sig = {"*": {type: "*", properties: {"*": {type: "*"}}}};
    let _jsd, _schema, _sH;

    beforeEach(() => {
        _jsd = new JSD(_sig);
        _schema = new Schema(_sig, null, _jsd);
        _sH = new SchemaHelpers(_schema);
    });

    describe("Instantiation", () => {
        it("should reference the schema invoking it", () => {
            expect(_sH._ref === _schema).toBe(true);
        });

        it("should provide the expected interface", () => {
            expect(_sH.setObject).toBeDefined();
            expect(_sH.setChildObject).toBeDefined();
            expect(_sH.createSchemaChild).toBeDefined();
            expect(_sH.validate).toBeDefined();
            expect(typeof _sH.setObject).toBe("function");
            expect(typeof _sH.setChildObject).toBe("function");
            expect(typeof _sH.createSchemaChild).toBe("function");
            expect(typeof _sH.validate).toBe("function");
        });
    });

    describe("Child Object Methods", () => {
        beforeEach(() => {
            _jsd = new JSD(_sig);
            _schema = new Schema(_sig, null, _jsd);
            _sH = new SchemaHelpers(_schema);
        });

        it("should set Schema from Object values", () => {
            expect((typeof _sH.setObject({foo: "bar"})) === "string").toBe(false);
            expect(_schema.model.foo).toBe("bar");
        });

        describe("Create Object", () => {
            it("should create Child Schema Object", () => {
                let _sC = _sH.createSchemaChild("foo", {}, {extensible: false}, _mdRef.get(_schema));
                expect((typeof _sC) === "string").toBe(false);
                expect(_sC instanceof Schema).toBe(true);
            });
        });
        describe("Set Values", () => {
            it("should set Value Object on Child Schema", () => {
                const sH = new SchemaHelpers(_schema);
                const _child = sH.setChildObject("", {baz: 123});
                expect(typeof _child).toBe("object");
                expect(_child.baz).toBe(123);
            });
        });

    });

    describe("Walk Schema", () => {
        it("should handle nested Object Validators", () => {
            let _sig = {
                "*": {
                    type: "*",
                    properties: {
                        type: "*",
                        "*": {
                            type: "*",
                        },
                    },
                },
            };
            _jsd = new JSD(_sig);
            _schema = new Schema(_sig, null, _jsd);
            _sH = new SchemaHelpers(_schema);
            _schema.model = {
                "foo": {
                    "bar": {
                        "baz": 123,
                    },
                },
            };
            const __vB = _vBuilders.get(_jsd);
            const _vList = __vB.list();
        });
        // it("Wildcard Validators", () => {
        //     _sH.setChildObject("*", {foo: 123});
        //     const __vB = _vBuilders.get(_jsd);
        //     const _vList = __vB.list();
        //     console.log(__vB.get(_vList[1]).$functs);
        //     console.log(__vB.get(_vList[2]).$functs[0].path);
        //     // __vB.get(_vList[2]).$joyJoy}`);
        // });
    });
});

// it("testing actual schema nesting", () => {
//     let jsd = new JSD({"*": {type: "*", properties: {"*": {type: "*"}}}});
//     jsd.document.model = {
//         foo: {
//             bar: "baz",
//         },
//     };
//     console.log(`>> result: ${jsd.document}`);
// });