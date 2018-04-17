import {basicModel} from "../../fixtures/PropertiesModel.schemas";
import {JSD} from "./jsd";

describe("Model Class Tests", () => {
    describe("Test Method", () => {
        let _jsd;

        beforeEach(() => {
            _jsd = new JSD(basicModel);
        });

        it("should validate models against schema", () => {
            const _d = {
                name: "Ed Testy",
                age: 99,
                active: true,
            };

            expect(_jsd.model.$ref.validate(_d)).toBe(true);

            _d.active = "1234";

            expect(_jsd.model.$ref.validate(_d)).toBe("data/active should be boolean");
        });
    });
})