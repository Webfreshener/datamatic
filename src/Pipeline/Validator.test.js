import {Validator} from "./Validator";
import {basicModel, nameRequiredSchema} from "../../fixtures/PropertiesModel.schemas";
import {default as DefaultVO} from "../schemas/default-pipe-vo.schema";
import {default as JSONSchemaDraft04} from "../schemas/json-schema-draft-04";

const hasDraft04 = () => {
   try {
      // eslint-disable-next-line global-require
      const mod = require("ajv-draft-04");
      return Boolean(mod && (mod.default || mod));
   } catch (e) {
      return false;
   }
};

describe("TxValidator Test Suite", () => {
   describe("Schema Handling", () => {
      it("should accept stand-alone schema", () => {
         const _txV = new Validator(DefaultVO);
         expect(_txV.errors).toEqual(null);
      });
      it("should accept schema config", () => {
          const _txV = new Validator( {
              schemas: [DefaultVO]
          });
          expect(_txV.errors).toEqual(null);
      });
   });

   describe("TxValidator.validateSchemas", () => {
      it("should pass valid schema", () => {
         expect(Validator.validateSchemas(nameRequiredSchema)).toEqual(true);
      })
   });

   describe("basic validation", () => {
      let _txV;
      beforeEach(() => {
         _txV = new Validator( {
            meta: [],
            schemas: [basicModel]
         });
      });
      it("should validate data", () => {
         const model = {
            name: "test",
            active: true,
            age: 99,
         };
         expect(_txV.errors === null).toBe(true);

         // set age to invalid data type
         _txV.model = Object.assign({}, model, {age: "99"});
         expect(_txV.errors === null).toBe(false);
      });
   });

   describe("validation with meta", () => {
      it("should validate data with meta", () => {
         const build = () => new Validator( {
            meta: [JSONSchemaDraft04],
            schemas: [Object.assign(basicModel, {
               $schema: "http://json-schema.org/draft-04/schema#",
            })],
         });

         if (!hasDraft04()) {
            return expect(build).toThrow("ajv-draft-04");
         }

         const _txV = build();
         _txV.model = {
            name: "test",
            active: true,
            age: 99,
         };
         expect(_txV.errors === null).toBe(true);
         const invalid = {
            name: "test",
            active: "not-bool",
            foo: "bar",
            age: "not-number",
         };
         _txV.model = invalid;
         expect(_txV.validate(invalid)).not.toBe(true);
      });
   });
});
