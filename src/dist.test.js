describe("node commonjs require", () => {
    it("should import RxVO and create document", ()=> {
        let RxVO = require("../index").RxVO;
        let rxvo = new RxVO({foo: {type: "String"}});
        rxvo.model = {
            foo: "bar"
        };
        expect(rxvo.model.foo).toBe("bar");
    });
});
