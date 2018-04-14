import {Schema} from "./schema";
import {JSD} from "./jsd";
import {_vBuilders} from "./_references";
import {default as deepEqual} from "deep-equal";
import {default as jsonSchema} from "../../fixtures/simple.schema";

describe("Schema Class Test Suite", function () {
    beforeEach(() => {
        this.jsd = new JSD(jsonSchema);
    });
    describe("LifeCycle: Create", () => {
        it("should initialize a schema and and a schema object", () => {
            expect(this.jsd.document).toBeDefined();
            expect(this.jsd.document instanceof Schema).toBe(true);
        });
        it("should not initialize a invalid schema and schema object", () => {
            let badSchema = Object.assign({}, jsonSchema, {
                properties: {
                    "bad thing": {
                        type: "INVALID",
                    },
                },
            });
            expect(() => new JSD(badSchema)).toThrow();
        });
    });
    describe("LifeCycle: Population", () => {
        it("should populate with valid data and make that data accessible", () => {

        });
        it("should reject invalid data and leave model pristine", () => {

        });
    });
});
