import {VxBehaviorSubject} from "./vxBehaviorSubject";

describe("vxBehaviorSubject", () => {
    let _t;
    beforeEach(() => {
        _t = VxBehaviorSubject.create();
    });

    it("should handle next", (done) => {
        let _cnt = 0;

        _t.subscribe({
            next: (d) => {
                expect(d).toEqual("ok");
                if ((++_cnt) === 2) {
                    done();
                }
            }
        });

        _t.next("ok");
        _t.next("ok");
    });

    it("should handle error", (done) => {
        const _d = "error message";
        let _cnt = 0;

        _t.subscribe({
            error: (d) => {
                expect(d).toEqual(_d);
                if ((++_cnt) === 2) {
                    done();
                }
            }
        });

        _t.error(_d);
        _t.error(_d);
    });

    it("should handle complete", (done) => {
        _t.subscribe({
            complete: () => {
                done();
            },

        });
        _t.complete();
    })
});
