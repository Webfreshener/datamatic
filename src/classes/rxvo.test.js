import {RxVO} from "./rxvo"
import {basicModel} from "../../fixtures/PropertiesModel.schemas";

describe("RxVO Instance Test", () => {
    let _rxvo;

    beforeEach(() => {
        _rxvo = new RxVO(basicModel);
    });

    it("expects a valid RxVO instance",() => {
        expect(_rxvo instanceof RxVO).toBe(true);
    });

    it("expects RxVO Instances to create a valid RxVO Document", () => {

        _rxvo.model = {
            "name": "test",
        };
        expect(`${_rxvo.model.name}`).toEqual("test");
    });
});
