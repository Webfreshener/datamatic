import {
    makeClean, makeDirty, getDefaults,
    getPatternPropertyDefaults, validate,
    refValidation, refAtKeyValidation, walkObject, getSchemaID
} from "./utils";

import {
    basicModel, nestedModel,
    patternModel, nestedPatternModel
} from "../../fixtures/PropertiesModel.schemas";

import {Model} from "./index";

describe("Utils tests", () => {
    describe("make dirty and make clean", () => {
        describe("basic PropertiesModel dirtiness", () => {
            const _owner = new Model(basicModel);
            it("should make model dirty", () => {
                makeDirty(_owner.model.$model);
                expect(_owner.model.$model.isDirty).toBe(true);
            });

            it("should make model clean", () => {
                makeClean(_owner.model.$model);
                expect(_owner.model.$model.isDirty).toBe(false);
            });
        });

        describe("nested PropertiesModel dirtiness", () => {
            const _owner = new Model({schemas: [nestedModel]});
            _owner.model = {
                aObject: {
                    bObject: {
                        bValue: 123,
                    },
                },
            };
            it("should make model dirty", () => {
                makeDirty(_owner.model.aObject.bObject.$model);
                expect(_owner.model.aObject.$model.isDirty).toBe(false);
                expect(_owner.model.aObject.bObject.$model.isDirty).toBe(true);
            });

            it("should make model clean", () => {
                makeClean(_owner.model.aObject.bObject.$model);
                expect(_owner.model.aObject.bObject.$model.isDirty).toBe(false);
            });
        });
    });

    describe("Validation Methods", () => {
        describe("refValidation tests", () => {
            const _owner = new Model({schemas: [basicModel]});

            it("should pass validation against refValidation", () => {
                const _res = refValidation(_owner.model.$model,
                    {name: "test", age: 99, active: true});
                expect(_res).toBe(true);
            });

            it("should fail validation against refValidation", () => {
                const _res = refValidation(_owner.model.$model,
                    {name: "test", age: "99", active: true});
                expect(_res).toBe("data/age must be number");
            });
        });

        describe("refAtKeyValidation tests", () => {
            const _owner = new Model({schemas: [nestedModel]});
            const _data = {
                aObject: {
                    bObject: {
                        bValue: 123,
                    },
                },
            };
            _owner.model = _data;
            it("should pass validation against refValidation", () => {
                const _res = refAtKeyValidation(_owner.model.aObject.$model,
                    "properties/bObject", _data.aObject.bObject);
                expect(_res).toBe(true);
            });

            it("should fail validation against refValidation", () => {
                _data.aObject.bObject.bValue = "123";
                const _res = refAtKeyValidation(_owner.model.aObject.$model,
                    "properties/bObject", _data.aObject.bObject);
                expect(_res).toBe("data/bValue must be integer");
            });
        });

        describe("validate method", () => {
            const _owner = new Model({schemas: [basicModel]});
            const _data = {name: "test", age: 99, active: true};
            it("should pass validation against refValidation", () => {
                const _res = validate(_owner.model.$model, "", _data);
                expect(_res).toBe(true);
            });

            it("should fail validation against refValidation", () => {
                _data.age = "99"
                const _res = validate(_owner.model.$model, "", _data);
                expect(_res).toBe("data/age must be number");
            });
        });
    });

    describe("getDefaults tests", () => {
        it("should getDefaults from schema", () => {
            const _schema = {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        default: "a name",
                    },
                },
            };
            expect(getDefaults(_schema)).toEqual({name: "a name"});
        });

        it("should getDefaults from PatternProperty schema", () => {
            const _schema = {
                type: "object",
                patternProperties: {
                    ".*": {
                        type: "object",
                        default: {
                            value: "abcd",
                        },
                    },
                },
            };
            expect(getDefaults(nestedPatternModel)).toEqual(null);
        });
    });

    describe("getPatternPropertyDefaults tests", () => {
        it("should get pattern properties for basic Properties element", () => {
            expect(getPatternPropertyDefaults(patternModel))
                .toEqual({"[^name]": {"value": "default value"}});
        });

        it("should get pattern properties for Nested Properties element", () => {
            expect(getPatternPropertyDefaults(nestedPatternModel)).toEqual(null);
            expect(getPatternPropertyDefaults(nestedPatternModel.properties.nested))
                .toEqual({".*": {"value": "default value"}});
        })
    });

    describe("walkObject test", () => {
        it("should walk object", () => {
            const _obj = {a: {b: {c: {val: "string"}}}};
            expect(walkObject("a/b/c", _obj)).toEqual({val: "string"});
            // with delimiter
            expect(walkObject("a.b.c", _obj, ".")).toEqual({val: "string"});
        });
    });
    describe("getSchemaId test", () => {
        it("should get schema id", () => {
            expect(getSchemaID({id: "schema1#"})).toEqual("schema1#");
            expect(getSchemaID({$id: "schema2#"})).toEqual("schema2#");
            expect(getSchemaID({})).toEqual("root#");
        });
    });
});
