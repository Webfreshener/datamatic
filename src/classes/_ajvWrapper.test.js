import {default as JSONSchemaV4} from "../schemas/json-schema-draft-04";
import {default as JSONSchemaV6} from "../schemas/json-schema-draft-06";
import {default as OpenAPIv2} from "../../fixtures/OpenAPIv2";
import {default as PetStoreV2} from "../../fixtures/petstore.v2";
import {default as BasicAPI} from "../../fixtures/basic-api.swagger";
import Ajv from "ajv";
import {AjvWrapper} from "./_ajvWrapper";
import {RxVO} from "./rxvo";

describe("AJVWrapper Tests", () => {
    describe("AJV Standalone -- version integrity & debug", () => {
        it("should handle v4 Schemas", () => {
            const opts = {
                schemaId: "auto",
                jsonPointers: true,
                allErrors: false,
                extendRefs: true,
            };
            const _ajv = new Ajv(opts);
            _ajv.addMetaSchema(JSONSchemaV4);
            _ajv.addMetaSchema(JSONSchemaV6);
            _ajv.addSchema(OpenAPIv2, "http://swagger.io/v2/schema.json#");
            const _v = _ajv.getSchema("http://swagger.io/v2/schema.json");
            const _isValid = _v(PetStoreV2);
            expect(_isValid).toBe(true);
        });
    });

    describe.only("AJVWrapper", () => {
        it("should handle v4 Schemas", () => {
            const opts = {
                schemaId: "auto",
                jsonPointers: true,
                allErrors: false,
                extendRefs: true,
            };

            const schemas = {
                meta: [JSONSchemaV4],
                schemas: [OpenAPIv2],
                use: "http://swagger.io/v2/schema.json#"
            };

            const rxvo = new RxVO(schemas);
            // const _ajv = new AjvWrapper(rxvo, schemas, opts);
            const _isValid = rxvo.validate("http://swagger.io/v2/schema.json#", PetStoreV2);
            // const _isValid = _ajv.exec("http://swagger.io/v2/schema.json#", PetStoreV2);
            console.log(rxvo.errors);
            expect(_isValid).toBe(true);
        });
    });
});