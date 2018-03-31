import {BaseValidator, Validator} from "./_validators";
import {JSD} from "./jsd";
import deepEqual from "deep-equal";
import {_vBuilders, _validators} from "./_references";

const _genericSchema = {"*": {type: "*"}};
const _setSchema = [_genericSchema];
describe("Validator Class Tests", () => {
    let _jsd = new JSD(_schema);
    let _schema = _genericSchema;

    describe("BaseValidator Tests", () => {
        const _base = new BaseValidator("", _genericSchema, _jsd);
        describe("Instantiation", () => {

            it("should instantiate", () => {
                expect(_base).toBeDefined();
            });

            it("should provide the expected interface", () => {
                expect(_base.validations).toBeDefined();
                expect(_base.signature).toBeDefined();
                expect(_base.jsd).toBeDefined();
                expect(_base.call).toBeDefined();
                expect(_base.checkType).toBeDefined();
                expect(_base.exec).toBeDefined();
                expect(typeof _base.call).toBe("function");
                expect(typeof _base.checkType).toBe("function");
                expect(typeof _base.exec).toBe("function");
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_base.signature, _genericSchema)).toBe(true);
            })
        });

        describe("Basic Validation", () => {
            it("should check signature types against provided values", () => {
                expect(_base.checkType("String", "a string")).toBe(true);
                expect(_base.checkType("String", true)).toBe("'' expected String, type was '<boolean>'");
                expect(_base.checkType("String", {foo: "bar"})).toBe("'' expected String, type was '<object>'");
                expect(_base.checkType("String", 1)).toBe("'' expected String, type was '<number>'");
            });

            it("should check an array of allowed types against provided values", () => {
                expect(_base.checkType(["Number", "Boolean", "String"], "a string")).toBe(true);
                // -- seems we should error with the full array of allowed types, presently only last value is passed
                expect(_base.checkType(["Number", "String"], true)).toBe("'' expected String, type was '<boolean>'");
            });

            it("should call validators set to paths", () => {
                _vBuilders.get(_jsd).set("pass", () => true);
                _vBuilders.get(_jsd).set("fail", () => "this is a failure");
                expect(_base.call("pass", "a string")).toBe(true);
                expect(_base.call("fail", "a string")).toBe("this is a failure");
            });

            it("should provide validation results", () => {
               expect(_base.validations.pass).toBe(true);
               expect(_base.validations.fail).toBe("this is a failure");
            });
        });
    });

    describe("String Validator Tests", () => {
        const _name = "string";
        const _type = "string";
        const _sig = {type: "String"};
        const _validator = new Validator.String(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                expect(_validator.exec("a string")).toBe(true);
                expect(_validator.exec(123)).toBe(`'${_name}' expected ${_type}, type was '<number>'`);
                expect(_validator.exec(true)).toBe(`'${_name}' expected ${_type}, type was '<boolean>'`);
                expect(_validator.exec({foo: true})).toBe(`'${_name}' expected ${_type}, type was '<object>'`);
            });
        });
    });

    describe("Number Validator Tests", () => {
        const _name = "number";
        const _type = "number";
        const _sig = {type: "Number"};
        const _validator = new Validator.Number(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                expect(_validator.exec(123)).toBe(true);
                expect(_validator.exec("a string")).toBe(`'${_name}' expected ${_type}, type was '<string>'`);
                expect(_validator.exec(true)).toBe(`'${_name}' expected ${_type}, type was '<boolean>'`);
                expect(_validator.exec({foo: true})).toBe(`'${_name}' expected ${_type}, type was '<object>'`);
            });
        });
    });

    describe("Boolean Validator Tests", () => {
        const _name = "bool";
        const _type = "boolean";
        const _sig = {type: "Boolean"};
        const _validator = new Validator.Boolean(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                expect(_validator.exec(false)).toBe(true);
                expect(_validator.exec(123)).toBe(`'${_name}' expected ${_type}, type was '<number>'`);
                expect(_validator.exec("a string")).toBe(`'${_name}' expected ${_type}, type was '<string>'`);
                expect(_validator.exec({foo: true})).toBe(`'${_name}' expected ${_type}, type was '<object>'`);
            });
        });
    });

    describe("Object Validator Tests", () => {
        const _name = "object";
        const _type = "Object";
        const _sig = {type: "Object", elements: {"*": {type: "*"}}};
        const _validator = new Validator.Object(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                expect(_validator.exec({foo: true})).toBe(true);
                expect(_validator.exec(123)).toBe(`'${_name}' expected value of type '${_type}'. Type was '<number>'`);
                expect(_validator.exec("a string")).toBe(`'${_name}' expected value of type '${_type}'. Type was '<string>'`);
                expect(_validator.exec(false)).toBe(`'${_name}' expected value of type '${_type}'. Type was '<boolean>'`);
            });
        });
    });

    describe("Array Validator Tests", () => {
        const _name = "";
        const _type = "Array";
        const _sig = [{type: "*"}];
        const _validator = new Validator.Array(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                // .. interestingly, there is no path update for items in array done by validator
                const _v = new Validator.String("", {type: "String"}, _jsd);
                _vBuilders.get(_jsd).set("", () => true);
                expect(_validator.exec(["string"])).toBe(true);
                expect(_validator.exec({foo: true})).toBe("type of array was expected for ''. type was '<object>'");
                expect(_validator.exec(123)).toBe("type of array was expected for ''. type was '<number>'");
                expect(_validator.exec("a string")).toBe("type of array was expected for ''. type was '<string>'");
                expect(_validator.exec(false)).toBe("type of array was expected for ''. type was '<boolean>'");
            });
        });
    });

    describe("Default Validator Tests", () => {
        const _name = "default";
        const _type = "string";
        const _sig = {type: "String"};
        const _validator = new Validator.Default(_name, _sig, _jsd);
        describe("Instantiation", () => {
            it("should instantiate", () => {
                expect(_validator).toBeDefined();
            });

            it("should reference the expected signature", () => {
                expect(deepEqual(_validator.signature, _sig)).toBe(true);
            });
        });

        describe("validation", () => {
            it("should perform validation with exec method", () => {
                expect(_validator.exec("a string")).toBe(true);
                expect(_validator.exec(123)).toBe(`'${_name}' expected ${_type}, type was '<number>'`);
                expect(_validator.exec(true)).toBe(`'${_name}' expected ${_type}, type was '<boolean>'`);
                expect(_validator.exec({foo: true})).toBe(`'${_name}' expected ${_type}, type was '<object>'`);
            });
        });
    });
});
