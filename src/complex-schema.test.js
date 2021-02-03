import {default as Schema} from "../fixtures/basic-refs.schema";
import {default as Data} from "../fixtures/basic-refs.data";
import {default as OpenAPIv2} from "../fixtures/OpenAPIv2";
import {default as JSONSchema4} from "../fixtures/json-schema-draft04.schema";
import {default as basicAPI} from "../fixtures/petstore.v2"
import {Model} from "./Model";

describe("Basic Refs", () => {
    describe("ref handling", () => {
        it("should validate schema containing $refs and definitions", (done) => {
            const _rxvo = new Model({schemas: [Schema]});
            _rxvo.subscribe({
                next: (model) => {
                    expect(_rxvo.errors).toBe(null);
                    expect(model.toJSON()).toEqual(Data);
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                }
            });
            _rxvo.model = Data;
        });
    });

    describe("OPenAPI Tests", () => {
        it("should load and validate OpenAPIv2 Schema", () => {
            const _rxvo = new Model({
                meta: [JSONSchema4],
                schemas: [OpenAPIv2],
                use: "http://swagger.io/v2/schema.json#"
            });
                _rxvo.model = basicAPI;
            // test to ensure no errors were logged
            expect(_rxvo.errors).toBe(null);
            // test for completeness
            expect(_rxvo.toJSON()).toEqual(basicAPI);
        })
            ;
        })
    });
