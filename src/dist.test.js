describe("node commonjs require", () => {
    it("should import JSD and create document", ()=> {
        let JSD = require('../index');
        let jsd = new JSD({foo: {type: "String"}});
        jsd.document.model = {
            foo: "bar"
        };
        expect(jsd.document.model.foo).toBe('bar');
    });
});
