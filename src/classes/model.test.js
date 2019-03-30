import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {RxVO} from "./rxvo";

describe("Model Class Tests", () => {
    describe("Test Method", () => {
        let _rxvo;
        const _d = {
            name: "Ed Testy",
            age: 99,
            active: true,
        };

        beforeEach(() => {
            _rxvo = new RxVO({schemas: [basicModel]});
            _d.active = true;
        });

        it("should validate models against schema", () => {


            expect(_rxvo.model.$model.validate(_d)).toBe(true);

            _d.active = "1234";

            expect(_rxvo.model.$model.validate(_d)).toBe("data/active should be boolean");
        });

        it("should support subscription callbacks object", (done) => {
            _rxvo.subscribe({
                next: () => done(),
                error: done,
            });
            _rxvo.model = _d;
        });

        it("should support next callback", (done) => {
            _rxvo.subscribe(() => done());
            _rxvo.model = _d;
        })
    });
})
