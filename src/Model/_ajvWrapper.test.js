import {default as JSONSchemaV4} from "../schemas/json-schema-draft-04";
import {default as JSONSchemaV6} from "../schemas/json-schema-draft-06";
import {default as OpenAPIv2} from "../../fixtures/OpenAPIv2";
import {default as PetStoreV2} from "../../fixtures/petstore.v2";
import {default as BasicAPI} from "../../fixtures/basic-api.swagger";
import Ajv from "ajv";
import {AjvWrapper} from "./_ajvWrapper";
import {Model} from "./index";
import addFormats from "ajv-formats";

describe("AJVWrapper Tests", () => {
    describe("AJV Standalone -- version integrity & debug", () => {
        it("should handle OpenAPI2.0 Schemas (updated to JSON-Schema draft-07)", () => {
            const _ajv = new Ajv({
                allowUnionTypes: true,
            });

            addFormats(_ajv);

            _ajv.addSchema(JSONSchemaV4,"http://json-schema.org/draft-04/schema#");
            _ajv.addSchema(OpenAPIv2, "http://swagger.io/v2/schema.json#");

            const _v = _ajv.validate("http://swagger.io/v2/schema.json#", PetStoreV2);

            expect(_ajv.errors).toBe(null);
            expect(_v).toBe(true);

        });
    });

    describe("AJVWrapper", () => {
        it("should handle v6 Schemas", () => {
            const schemas = {
                meta: [JSONSchemaV4],
                schemas: [OpenAPIv2],
            };

            const owner = new Model(schemas);
            const _ajv = new AjvWrapper(owner, schemas);

            const _isValid = _ajv.exec("http://swagger.io/v2/schema.json#", PetStoreV2);
            owner.model = PetStoreV2;

            expect(owner.errors).toBe(null);
            expect(_isValid).toBe(true);
            expect(JSON.parse(`${owner}`)).toEqual(PetStoreV2);
        });
    });
});
