import {basicModel} from "../fixtures/PropertiesModel.schemas";
const _d = {
    name: "Ed Testy",
    age: 99,
    active: true,
};

describe("node commonjs require", () => {
    const {RxVO} = require("../index");
    let rxvo;

    beforeEach(() => {
        rxvo = new RxVO({
            schemas: [basicModel],
        });
    });

    it("should import RxVO and create document", ()=> {
        rxvo.model = {
            foo: "bar"
        };
        expect(rxvo.model.foo).toBe("bar");
    });

    it("should be an observable", (done) => {
        let _ival = 0;
        const _arr = new Array(0, 2000);
        const _iterator = {
            next: (
                () => _ival++ < _arr.length ? {
                    value: rxvo.model = _d,
                    done: false,
                } : {
                    value: rxvo.freeze(),
                    done: true,
                }
            ),
        };
        rxvo.subscribe({next: _iterator.next, complete: done});
        _iterator.next();
    });
});
