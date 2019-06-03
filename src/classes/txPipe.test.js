import {RxVO} from "./rxvo";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";

describe("TxPipes tests", () => {
    let _p;
    let _vo;

    beforeEach(() => {
        _vo = new RxVO({schemas: [basicCollection]});
        _p = _vo.pipe({
            schema: basicCollection,
            exec: (d) => d.filter((itm) => itm.active),
        });
    });

    it("should provide a pipe", (done) => {
        // subscribe to pipe
        const _sub = _p.subscribe({
                next: (d) => {
                    _sub.unsubscribe();
                    // data in VO as been filtered by Pipe
                    expect(d.model.length).toEqual(3);
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
