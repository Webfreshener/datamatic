describe("node commonjs require", () => {
    it("should import JSD and create document", ()=> {
        let JSD = require("../index").JSD;
        let jsd = new JSD({foo: {type: "String"}});
        jsd.model = {
            foo: "bar"
        };
        expect(jsd.model.foo).toBe("bar");
    });
});
