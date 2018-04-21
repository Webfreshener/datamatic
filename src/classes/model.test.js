import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {RxVO} from "./rxvo";

describe("Model Class Tests", () => {
    describe("Test Method", () => {
        let _rxvo;

        beforeEach(() => {
            _rxvo = new RxVO(basicModel);
        });

        it("should validate models against schema", () => {
            const _d = {
                name: "Ed Testy",
                age: 99,
                active: true,
            };

            expect(_rxvo.model.$model.validate(_d)).toBe(true);

            _d.active = "1234";

            expect(_rxvo.model.$model.validate(_d)).toBe("data/active should be boolean");
        });
    });
})