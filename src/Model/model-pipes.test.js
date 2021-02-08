import {Model} from "./index";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";

describe("Pipes tests", () => {
    let _p;
    let _vo;

    beforeEach(() => {
        _vo = new Model({schemas: [basicCollection]});
        _p = _vo.pipeline(
            [(itm) => itm.active ? itm : undefined],
            basicCollection,
        );
    });

    it("should provide a pipeline", (done) => {
        // subscribe to pipeline
        const _sub = _p.subscribe({
                next: (d) => {
                    _sub.unsubscribe();
                    // data in VO as been filtered by Pipeline
                    expect(d.length).toEqual(3);
                    done();
                },
                error: (e) => {
                    _sub.unsubscribe();
                    done(e);
                }
            });
        // -- write to VO
        _vo.model = data;
    });

});
