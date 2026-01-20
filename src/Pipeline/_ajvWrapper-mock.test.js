const setupMocks = () => {
    jest.resetModules();
    jest.doMock("ajv", () => {
        return jest.fn().mockImplementation(() => ({
            addSchema: jest.fn(),
            addMetaSchema: jest.fn(),
            validate: jest.fn(() => true),
            errors: null,
        }));
    });
    const Ajv = require("ajv");
    const {AjvWrapper} = require("./_ajvWrapper");
    return {Ajv, AjvWrapper};
};

describe("Pipeline AjvWrapper mock coverage", () => {
    afterEach(() => {
        jest.dontMock("ajv");
    });

    it("handles schema normalization and addSchema branches", () => {
        const {Ajv, AjvWrapper} = setupMocks();
        const wrapper = new AjvWrapper({schemas: [{$id: "root#", type: "object"}]});
        wrapper.addSchema({$id: "extra#", type: "string"});
        wrapper.addSchema({$id: "extra#", type: "string"}, "extra#");

        const ajvInstance = Ajv.mock.results[0].value;
        expect(ajvInstance.addSchema).toHaveBeenCalled();
    });

    it("covers meta and boolean schemas", () => {
        const {AjvWrapper} = setupMocks();
        const wrapper = new AjvWrapper({meta: [{type: "object"}], schemas: true});
        expect(wrapper.$ajv).toBeDefined();
    });

    it("covers non-array meta and missing meta branches", () => {
        const {AjvWrapper} = setupMocks();
        const withMetaObject = new AjvWrapper({meta: {type: "object"}, schemas: {$id: "root#", type: "object"}});
        expect(withMetaObject.$ajv).toBeDefined();

        const withoutMeta = new AjvWrapper({schemas: {$id: "root#", type: "object"}});
        expect(withoutMeta.$ajv).toBeDefined();
    });

    it("skips normalization for non-objects and existing validator cache", () => {
        const {AjvWrapper} = setupMocks();
        const originalGet = WeakMap.prototype.get;
        WeakMap.prototype.get = () => ({});
        try {
            const wrapper = new AjvWrapper("schema");
            expect(wrapper.path).toBe("root#");
        } finally {
            WeakMap.prototype.get = originalGet;
        }
    });

    it("normalizes schema ids with and without trailing hash", () => {
        const {AjvWrapper} = setupMocks();
        const noHash = new AjvWrapper({$id: "root", type: "object"});
        const withHash = new AjvWrapper({$id: "root#", type: "object"});
        expect(noHash.path).toBe("root#");
        expect(withHash.path).toBe("root#");
    });

    it("handles missing schemas input", () => {
        const {AjvWrapper} = setupMocks();
        const wrapper = new AjvWrapper();
        expect(wrapper.$ajv).toBeDefined();
    });
});
