import {default as Schema} from "../fixtures/basic-refs.schema";
import {default as Data} from "../fixtures/basic-refs.data";
import {default as OpenAPIv2} from "../fixtures/OpenAPIv2";
import {default as JSONSchema4} from "../fixtures/json-schema-draft04.schema";
import {default as basicAPI} from "../fixtures/basic-api.swagger"
import {RxVO} from "./classes/rxvo";

describe("Basic Refs", () => {
   describe("ref handling", () => {
       it("should validate schema containing $refs and definitions", (done) => {
           const _rxvo = new RxVO({schemas: [Schema]});
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
            const _rxvo = new RxVO({meta: [JSONSchema4], schemas: [OpenAPIv2]});
            _rxvo.model = basicAPI;
            // test to ensure no errors were logged
            expect(_rxvo.errors).toBe(null);
            // test for completeness
            expect(_rxvo.toJSON()).toEqual(basicAPI);
        });
    })
});