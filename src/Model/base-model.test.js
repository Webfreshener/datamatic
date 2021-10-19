import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {Model} from "./index";

describe("Model Class Tests", () => {
    describe("Test Method", () => {
        let _owner;
        const _d = {
            name: "Ed Testy",
            age: 99,
            active: true,
        };

        beforeEach(() => {
            _owner = new Model({schemas: [basicModel]});
            _d.active = true;
        });

        it("should validate models against schema", () => {
            expect(_owner.model.$model.validate(_d)).toBe(true);
            _d.active = "1234";
            expect(_owner.model.$model.validate(_d)).toBe("data/active must be boolean");
        });

        it("should support subscription callbacks object", (done) => {
            _owner.subscribe({
                next: () => done(),
                error: done,
            });
            _owner.model = _d;
        });

        it("should allow function as next callback", (done) => {
            _owner.subscribe(() => done());
            _owner.model = _d;
        });

        it("should be observable", (done) => {
            let _ival = 0;
            const _arr = new Array(0, 2000);
            const _iterator = {
                next: (
                    () => _ival++ < _arr.length ? {
                        value: _owner.model = _d,
                        done: false,
                    } : {
                        value: _owner.freeze(),
                        done: true,
                    }
                ),
            };
            _owner.subscribe({next: _iterator.next, complete: done});
            _iterator.next();
        });
    });
});
