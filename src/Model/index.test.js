import {Model} from "./index"
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {default as basicRefs} from "../../fixtures/basic-refs.schema";
import {default as refsData} from "../../fixtures/basic-refs.data";

describe("Model Instance Test", () => {
    let _rxvo;

    beforeEach(() => {
        _rxvo = new Model({schemas: [basicModel]});
    });

    it("expects a valid Model instance", () => {
        expect(_rxvo instanceof Model).toBe(true);
    });

    it("should get it's schema", () => {
        expect(_rxvo.schema).toEqual(basicModel);
    });

    it("should get path elements", () => {
        expect(_rxvo.getSchemaForPath("properties/name")).toEqual({type: "string"});
    });

    it("expects Model Instances to create a valid Model Document", () => {
        _rxvo.model = {
            "name": "test",
        };

        expect(`${_rxvo.model.name}`).toEqual("test");
    });

    it("runs schema validator", () => {
        const _rxvo = new Model({
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
            const _rxvo = new Model({schemas: [basicRefs]});
            _rxvo.subscribe({
                error: (e) => console.log(JSON.stringify(e)),
            });
            _rxvo.model = refsData;
            expect(_rxvo.errors).toBe(null);
            _rxvo.model.aReference.valueA = "A String Value";
            expect(_rxvo.errors).toBe(null);
            expect(_rxvo.model).toEqual(refsData);
        });
    });
});
