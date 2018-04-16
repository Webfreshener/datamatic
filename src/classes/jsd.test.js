import {JSD} from "./jsd"
import {basicModel} from "../../fixtures/PropertiesModel.schemas";

describe("JSD Instance Test", () => {
    let _jsd;

    beforeEach(() => {
        _jsd = new JSD(basicModel);
    });

    it("expects a valid JSD instance",() => {
        expect(_jsd instanceof JSD).toBe(true);
    });

    it("expects JSD Instances to create a valid JSD Document", () => {

        _jsd.document.model = {
            "name": "test",
        };
        expect(`${_jsd.document.model.name}`).toEqual("test");
    });
});
