describe("src/index polyfill", () => {
    it("polyfills Object.assign when missing", () => {
        const originalAssign = Object.assign;
        try {
            Object.assign = undefined;
            jest.resetModules();
            jest.doMock("./Pipeline", () => ({Pipeline: function Pipeline() {}}));
            jest.doMock("./Model", () => ({Model: function Model() {}}));
            const mod = require("./index");
            expect(typeof Object.assign).toBe("function");
            expect(mod.Model).toBeDefined();
            expect(mod.Pipeline).toBeDefined();
        } finally {
            Object.assign = originalAssign;
            jest.dontMock("./Pipeline");
            jest.dontMock("./Model");
        }
    });
});
