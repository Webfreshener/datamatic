import {Model} from "./index"
import {ItemsModel} from "./itemsModel";
import {_schemaSignatures} from "./_references";
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {default as basicRefs} from "../../fixtures/basic-refs.schema";
import {default as refsData} from "../../fixtures/basic-refs.data";

describe("Model Instance Test", () => {
    let _owner;

    beforeEach(() => {
        _owner = new Model({schemas: [basicModel]});
    });

    it("expects a valid Model instance", () => {
        expect(_owner instanceof Model).toBe(true);
    });

    it("should get it's schema", () => {
        expect(_owner.schema).toEqual(basicModel);
    });

    it("should get path elements", () => {
        expect(_owner.getSchemaForPath("properties/name")).toEqual({type: "string"});
    });

    it("expects Model Instances to create a valid Model Document", () => {
        _owner.model = {
            "name": "test",
        };

        expect(`${_owner.model.name}`).toEqual("test");
    });

    it("runs schema validator", () => {
        const _owner = new Model({
            properties: {
                id: {type: "integer"},
                name: {type: "string"},
                value: {type: "integer"},
                createdOn: {type: "string"}
            },
        });

        expect(_owner.errors).toBe(null);
    });

    describe("Mixed schemas", () => {
        it("should allow mixed schemas to be selected and used", () => {
            const _owner = new Model({schemas: [basicRefs]});
            _owner.subscribe({
                error: (e) => console.log(JSON.stringify(e)),
            });
            _owner.model = refsData;
            expect(_owner.errors).toBe(null);
            _owner.model.aReference.valueA = "A String Value";
            expect(_owner.errors).toBe(null);
            expect(_owner.model).toEqual(refsData);
        });
    });

    it("throws when AjvWrapper reports invalid schema", () => {
        jest.isolateModules(() => {
            jest.doMock("./_ajvWrapper", () => ({
                AjvWrapper: class AjvWrapper {
                    constructor() {
                        this.$ajv = {
                            validateSchema: () => false,
                            errors: ["bad schema"],
                        };
                    }
                },
            }));
            const {Model: MockedModel} = require("./index");
            expect(() => new MockedModel({schemas: [basicModel]})).toThrow();
        });
    });

    it("selects ItemsModel and supports legacy schema ids", () => {
        const arrayOwner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {type: "string"},
        }]});
        expect(arrayOwner.model.$model).toBeInstanceOf(ItemsModel);

        const tupleOwner = new Model({schemas: [{
            $id: "tuple#",
            items: [{type: "string"}],
        }]});
        expect(tupleOwner.model.$model).toBeInstanceOf(ItemsModel);

        const legacyOwner = new Model({schemas: [{
            id: "legacy#",
            type: "object",
        }]});
        _schemaSignatures.set(legacyOwner, {schemas: [{id: "legacy#"}]});
        expect(legacyOwner.getSchemaForKey("legacy#").id).toBe("legacy#");

        const legacyOnly = Object.create(Model.prototype);
        _schemaSignatures.set(legacyOnly, {schemas: [{id: "only#"}]});
        expect(legacyOnly.getSchemaForKey("only#").id).toBe("only#");
    });
});
