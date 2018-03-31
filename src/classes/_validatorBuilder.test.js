import {ValidatorBuilder} from "./_validatorBuilder";
import {JSD} from "./jsd";

describe("ValidatorBuilder Class Tests", () => {
    describe("Class Methods", () => {
        const _vBuilder = new ValidatorBuilder();
        describe("Existence Tests", () => {
            it("should instantiate", () => {
                expect(_vBuilder).toBeDefined();
            });

            it("should provide an interface", () => {
                expect(_vBuilder.create).toBeDefined();
                expect(_vBuilder.exec).toBeDefined();
                expect(_vBuilder.get).toBeDefined();
                expect(_vBuilder.list).toBeDefined();
                expect(_vBuilder.set).toBeDefined();
                expect(typeof _vBuilder.create).toBe("function");
                expect(typeof _vBuilder.exec).toBe("function");
                expect(typeof _vBuilder.get).toBe("function");
                expect(typeof _vBuilder.list).toBe("function");
                expect(typeof _vBuilder.set).toBe("function");
            });
        });

        describe("Getter & Setters", () => {
            it("should SET & GET a validation function on it's Model", () => {
                _vBuilder.set(".setter.test", () => true);
                expect((_vBuilder.get(".setter.test"))()).toBe(true);
            });

            it("should LIST it's validators stored in it's Model", () => {
                expect(_vBuilder.list().length).toBe(1);
                expect(_vBuilder.list()[0]).toBe(".setter.test");
            });
        });

        describe("Creation", () => {
            it("should create Validator", () => {
                const _schema = {type: "String"};
                _vBuilder.create(_schema, "createTest", new JSD({"*": _schema}));
                expect(_vBuilder.list().indexOf("createTest") >= 0).toBe(true);
            })
        });

        describe("Execution", () => {
            it("should execute Validator", () => {
                expect(_vBuilder.exec("createTest", "a string")).toBe(true);
                expect(_vBuilder.exec("createTest", 123)).toBe("'createTest' expected string, type was '<number>'");
            });
        });
    })
});