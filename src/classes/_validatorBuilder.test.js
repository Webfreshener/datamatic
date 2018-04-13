import {ValidatorBuilder} from "./_validatorBuilder";
import {default as wildcardSchema} from "../../fixtures/wildcard.schema";
import {default as polymorphicSchema} from "../../fixtures/polymorphic.schema";
import {JSD} from "./jsd";
import {_vBuilders} from "./_references";

describe("ValidatorBuilder Class Tests", () => {
    describe("Class Methods", () => {
            describe("Existence Tests", () => {
                const _vBuilder = new ValidatorBuilder(new JSD());
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
                const _vBuilder = new ValidatorBuilder(new JSD());
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
                const _vBuilder = new ValidatorBuilder(new JSD());
                it("should create Validator", () => {
                    const _schema = {type: "String"};
                    _vBuilder.create(_schema, "createTest");
                    expect(_vBuilder.list().indexOf("createTest") >= 0)
                        .toBe(true);
                })
            });

        describe("Path Resolution", () => {
            it("should resolve basic paths", () => {
                const _jsd = new JSD({name: {type: "String"}});
                let _builders = _vBuilders.get(_jsd);
                let _paths = _builders.resolvePath("", "name");
                expect(_paths.length).toBe(1);
                expect(_paths[0]).toBe("name");
            });

            it("should resolve nested paths", () => {
                const _jsd = new JSD({
                    root: {
                        type: "Object",
                        elements: {
                            name: {
                                type: "String"
                            }
                        }
                    }
                });
                let _builders = _vBuilders.get(_jsd);
                let _paths = _builders.resolvePath("", "name");
                expect(_paths.length).toBe(1);
                expect(_paths[0]).toBe("root.name");
            });

            it("should resolve wildcard paths", () => {
                const _jsd = new JSD(wildcardSchema);
                let _builders = _vBuilders.get(_jsd);
                let _paths = _builders.resolvePath("*.*", "name");
                expect(_paths.length).toBe(1);
                expect(_paths[0]).toBe("*.*.name");
            });

            it("should resolve polymorphic paths", () => {
                const _jsd = new JSD(polymorphicSchema);
                let _builders = _vBuilders.get(_jsd);
                let _paths = _builders.resolvePath("*.polymorphic.1", "desc");
                expect(_paths.length).toBe(1);
                expect(_paths[0]).toBe("*.polymorphic.1.desc");
            });
        });

        describe("Execution", () => {
            it("should validate basic properties", () => {
                const _s = {createTest: {type: "String"}};
                const _jsd = new JSD(_s);
                const _vBuilder = _vBuilders.get(_jsd);
                expect(_vBuilder.exec("createTest", "a string")).toBe(true);
                expect(_vBuilder.exec("createTest", 123))
                    .toBe("'createTest' expected string, type was '<number>'");
            });
            it("should validate wildcard properties", () => {
                const _jsd = new JSD(wildcardSchema);
                const _vBuilder = _vBuilders.get(_jsd);
                const value = {foo: "bar"};
                expect(_vBuilder.exec("*", {root: value})).toBe(true);
                expect(_vBuilder.exec("*.*", value)).toBe(true);
                expect(_vBuilder.exec("*.*", {root: value}))
                    .toBe("'*.*.root' expected string, type was '<object>'");
            });
            it("should validate polymorphic properties", () => {
                const _jsd = new JSD(polymorphicSchema);
                const _vBuilder = _vBuilders.get(_jsd);
                const polyValue1 = {
                    id: 123,
                    name: "Name",
                    desc: "Some Text",
                };
                const polyValue2 = {
                    id: 123,
                    active: false,
                };
                expect(_vBuilder.exec("*.polymorphic.0", "string")).toBe(true);
                expect(_vBuilder.exec("*.polymorphic.1", polyValue1)).toBe(true);
                polyValue1.id = "123"
                expect(_vBuilder.exec("*.polymorphic.1", polyValue1))
                    .toBe("'*.polymorphic.1.id' expected number, type was '<string>'");
                expect(_vBuilder.exec("*.polymorphic.2", polyValue2)).toBe(true);
                polyValue2.active = "false"
                expect(_vBuilder.exec("*.polymorphic.2", polyValue2))
                    .toBe("'*.polymorphic.2.active' expected boolean, type was '<string>'");
            });
        });
    })
});