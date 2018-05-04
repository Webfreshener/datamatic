import {RxVO} from "./rxvo"
import {
    basicModel, nestedModelDefault,
    patternModel, nestedPatternModel
} from "../../fixtures/PropertiesModel.schemas";
import {default as OpenAPIv2} from "../../fixtures/OpenAPIv2";
import {default as jsonSchema} from "../../fixtures/json-schema-draft04.schema";
import {default as basicRefs} from "../../fixtures/basic-refs.schema";
import {default as refsData} from "../../fixtures/basic-refs.data";

describe("RxVO Instance Test", () => {
    let _rxvo;

    beforeEach(() => {
        _rxvo = new RxVO({schemas: [basicModel]});
    });

    it("expects a valid RxVO instance", () => {
        expect(_rxvo instanceof RxVO).toBe(true);
    });

    it("should get it's schema", () => {
        expect(_rxvo.schema).toEqual(basicModel);
    });

    it("should get path elements", () => {
        expect(_rxvo.getSchemaForPath("properties/name")).toEqual({type: "string"});
    });

    it("should get default values for path", () => {
        let _rxvo = new RxVO(nestedModelDefault);
        expect(_rxvo.getDefaultsForPath("")).toEqual({aObject: {bObject: {bValue: 123}}});
    });

    it("expects RxVO Instances to create a valid RxVO Document", () => {
        _rxvo.model = {
            "name": "test",
        };

        expect(`${_rxvo.model.name}`).toEqual("test");
    });

    it("runs schema validator", () => {
        const _rxvo = new RxVO({
            properties:
                {
                    id: {type: 'integer'},
                    name: {type: 'string'},
                    value: {type: 'integer'},
                    createdOn: {type: 'string'}
                },
        });

        expect(_rxvo.errors).toBe(null);
    });

    describe("Mixed schemas", () => {
        it("should allow mixed schemas to be selected and used", () => {
            const _rxvo = new RxVO({schemas: [basicRefs]});
            _rxvo.model = refsData;
            _rxvo.model.aReference.valueA = 1234;
            expect(_rxvo.errors === null).toBe(false);
            expect(_rxvo.model).toEqual(refsData);
        });
    });
});
