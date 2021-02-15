import {default as Schema} from "../fixtures/basic-refs.schema";
import {default as Data} from "../fixtures/basic-refs.data";
import {default as Swagger} from "../fixtures/OpenAPIv2";
import {default as OpenAPIv3} from "../fixtures/OpenAPIv3";
import {default as JSONSchema4} from "../fixtures/json-schema-draft04.schema";
import {default as basicAPI} from "../fixtures/petstore.v2"
import {default as heroSchema} from "../fixtures/api-hero.schema";

import {Model} from "./Model";

describe("Basic Refs", () => {
    describe("ref handling", () => {
        it("should validate schema containing $refs and definitions", (done) => {
            const _owner = new Model({schemas: [Schema]});
            _owner.subscribe({
                next: (model) => {
                    expect(_owner.errors).toBe(null);
                    expect(model.toJSON()).toEqual(Data);
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                }
            });
            _owner.model = Data;
        });
    });

    describe("OPenAPI Tests", () => {
        it("should load and validate Swagger Schema", () => {
            const _owner = new Model({
                meta: [JSONSchema4],
                schemas: [Swagger],
                use: "http://swagger.io/v2/schema.json#",
            });
            _owner.model = basicAPI;
            // test to ensure no errors were logged
            expect(_owner.errors).toBe(null);
            // test for completeness
            expect(_owner.toJSON()).toEqual(basicAPI);
        });

        it("should load and validate OpenAPIv3 Schema", () => {
            console.log("should load and validate OpenAPIv3 Schema");
            const _d = {
                openapi: "3.0.1",
                info: {
                    title: "testing",
                    version: "1.0.0",
                },
                paths: {},
            };
            const _owner = new Model({
                meta: [JSONSchema4],
                schemas: [OpenAPIv3],
                use: "http://openapis.org/v3/schema.json#",
            });
            _owner.model = _d;
            // test to ensure no errors were logged
            expect(_owner.errors).toBe(null);
            // test for completeness
            expect(_owner.toJSON()).toEqual(_d);
        });

        it("should load and validate OpenAPIv3 Schema $ref", () => {
            const _d = {
                name: "PetStore",
                schema: {
                    openapi: "3.0.1",
                    info: {
                        title: "testing",
                        version: "1.0.0",
                    },
                    paths: {},
                },
            };
            const _owner = new Model({
                meta: [JSONSchema4, Swagger, OpenAPIv3, heroSchema],
                schemas: [{
                    title: "JSON Schema for ApiHero Namespace Objects",
                    $id: "http://api-hero.webfreshener.com/v1/schema/namespace.json#",
                    allOf: [{
                        $ref: "http://api-hero.webfreshener.com/v1/schema.json#/definitions/namespace",
                    }],
                }],
                use: "http://api-hero.webfreshener.com/v1/schema/namespace.json#",
            });
            _owner.model = _d;
            expect(_owner.errors).toBe(null);
            expect(_owner.toJSON()).toEqual(_d);
        });
    });

});

