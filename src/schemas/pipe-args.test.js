import {Validator} from "../Pipe/Validator";
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {default as TxArgsSchema} from "./pipe-args.schema";

describe("Tx-Args Schema Tests", () => {
    let _txValidator;
    beforeEach(() => {
        try {
            _txValidator = new Validator(TxArgsSchema);
        } catch (e) {
            console.error(e);
        }
    });

    it("should accept valid json-schema", () => {
        _txValidator.validate(basicModel);
        expect(_txValidator.errors).toEqual(null);
    });

    it("should accept valid schema config", () => {
        _txValidator.validate({schemas: [basicModel]});
        expect(_txValidator.errors).toEqual(null);
    });

    it("should accept an array of schemas", () => {
        _txValidator.validate([basicModel, basicModel]);
        expect(_txValidator.errors).toEqual(null);
    });

    it("should reject restricted keywords", () => {
        const node = TxArgsSchema.definitions.Schema.properties;
        const keys = Object.keys(node);
        const _restricted = keys.filter((p) => node[p].hasOwnProperty("not"));
        const _schema = {schema: {}};
        const functor = () => {};
        let value;

        expect(_restricted.indexOf("exec")).toBeGreaterThan(-1);

        for (let idx = 0; idx < _restricted.length; idx++) {
            value = Object.assign({}, _schema);
            value[_restricted[idx]] = functor;
            expect(Validator.validateSchemas(value)).toEqual(false);
        }
    });
});
