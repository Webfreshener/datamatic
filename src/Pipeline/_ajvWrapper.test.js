import {AjvWrapper} from "./_ajvWrapper";
import {default as TxArgsSchema} from "../schemas/pipe-args.schema";
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {default as JSONSchemaDraft04} from "../schemas/json-schema-draft-04";

describe("AJVWrapper Tests", () => {
    let _ajv = null;
    const _data = {
        name: "Test",
        active: "true",
        age: 99
    };

    const hasDraft04 = () => {
        try {
            // eslint-disable-next-line global-require
            const mod = require("ajv-draft-04");
            return Boolean(mod && (mod.default || mod));
        } catch (e) {
            return false;
        }
    };

    describe("AJV Schema Validation", () => {

        it("should accept valid schemas", () => {
            let _ajv;
            expect(() => _ajv = new AjvWrapper({
                schemas: [basicModel],
            })).not.toThrow();

            const _res = _ajv.exec(basicModel.$id, Object.assign(_data, {active: true}));
            // should have no validator errors
            expect(_ajv.$ajv.errors).toEqual(null);
            // validator should return true
            expect(_res).toBe(true);
        });

    });

    describe("Meta-Schemas", () => {
        const _04Schema = Object.assign({}, basicModel, {
            $schema: "http://json-schema.org/draft-04/schema#"
        });

        it("should reject < draft-07 schema refs", () => {
            // should fail with errors
            expect(() => new AjvWrapper({schemas: [_04Schema],})).toThrow();
        });

        it("handles draft-04 meta schema opt-in", () => {
            const build = () => new AjvWrapper({
                meta: [JSONSchemaDraft04],
                schemas: [_04Schema]
            });
            if (hasDraft04()) {
                expect(build).not.toThrow();
            } else {
                expect(build).toThrow("ajv-draft-04");
            }
        });
    });

    describe("Schema as Data Validation", () => {
        beforeEach(() => {
            _ajv = new AjvWrapper({
                schemas: [TxArgsSchema],
            });
        });

        it("should reject invalid data", () => {
            const _res = _ajv.exec(TxArgsSchema.$id, {
                schema: {},
                exec: () => {
                },
            });

            // should have errors
            expect(_ajv.$ajv.errors === null).toBe(false);
            // validator result should be false
            expect(_res).toBe(false);

        });
    });
});
