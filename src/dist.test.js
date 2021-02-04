import {basicModel} from "../fixtures/PropertiesModel.schemas";
const _d = {
    name: "Ed Testy",
    age: 99,
    active: true,
};

describe("node commonjs require", () => {
    const {Model} = require("../index");
    let _model;

    beforeEach(() => {
        _model = new Model({
            schemas: [basicModel],
        });
    });

    it("should import Model and create document", ()=> {
        _model.model = {
            foo: "bar"
        };
        expect(_model.model.foo).toBe("bar");
    });

    it("should be an observable", (done) => {
        let _ival = 0;
        const _arr = new Array(0, 2000);
        const _iterator = {
            next: (
                () => _ival++ < _arr.length ? {
                    value: _model.model = _d,
                    done: false,
                } : {
                    value: _model.freeze(),
                    done: true,
                }
            ),
        };
        _model.subscribe({next: _iterator.next, complete: done});
        _iterator.next();
    });
});
