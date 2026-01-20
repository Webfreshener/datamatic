const setupMocks = () => {
    jest.resetModules();
    jest.doMock("ajv", () => {
        return jest.fn().mockImplementation(() => ({
            addMetaSchema: jest.fn(),
            addSchema: jest.fn(),
            validate: jest.fn(() => true),
            validateSchema: jest.fn(() => true),
            errors: null,
        }));
    });
    jest.doMock("ajv-formats", () => jest.fn());
    jest.doMock("./index", () => ({Model: class Model {}}));

    const Ajv = require("ajv");
    const {AjvWrapper} = require("./_ajvWrapper");
    const {Model} = require("./index");
    return {Ajv, AjvWrapper, Model};
};

describe("AjvWrapper meta and schema normalization", () => {
    afterEach(() => {
        jest.dontMock("ajv");
        jest.dontMock("ajv-formats");
        jest.dontMock("./index");
    });

    it("handles meta schemas and string schema entries", () => {
        const {Ajv, AjvWrapper, Model} = setupMocks();
        const owner = new Model();
        const schemas = {
            meta: [{$id: "meta#", type: "object"}],
            schemas: "http://example.com/schema",
            schema: {$id: "custom#"},
        };

        const wrapper = new AjvWrapper(owner, schemas);
        const ajvInstance = Ajv.mock.results[0].value;

        expect(ajvInstance.addMetaSchema).toHaveBeenCalledWith(schemas.meta[0]);
        expect(ajvInstance.addSchema).toHaveBeenCalledWith(schemas.schemas, "custom#");
        expect(wrapper.path).toBe("custom#");
    });

    it("handles empty schemas and missing meta", () => {
        const {AjvWrapper, Model} = setupMocks();
        const owner = new Model();
        const wrapper = new AjvWrapper(owner, {schemas: []});
        expect(wrapper.path).toBe("root#");
    });

    it("skips non-array meta and non-string schemas", () => {
        const {Ajv, AjvWrapper, Model} = setupMocks();
        const owner = new Model();
        const schemas = {
            meta: {type: "object"},
            schemas: {$id: "root#"},
        };
        const wrapper = new AjvWrapper(owner, schemas);
        const ajvInstance = Ajv.mock.results[0].value;
        expect(ajvInstance.addMetaSchema).not.toHaveBeenCalled();
        expect(ajvInstance.addSchema).not.toHaveBeenCalled();
        expect(wrapper.path).toBe("root#");
    });

    it("handles undefined schemas and skips normalization", () => {
        const {AjvWrapper, Model} = setupMocks();
        const owner = new Model();
        const wrapper = new AjvWrapper(owner);
        expect(wrapper.path).toBe("root#");
    });

    it("skips validator initialization when cache exists", () => {
        const {AjvWrapper, Model} = setupMocks();
        const owner = new Model();
        const originalGet = WeakMap.prototype.get;
        WeakMap.prototype.get = () => ({});
        try {
            const wrapper = new AjvWrapper(owner, "schema");
            expect(wrapper.path).toBe("root#");
        } finally {
            WeakMap.prototype.get = originalGet;
        }
    });
});
