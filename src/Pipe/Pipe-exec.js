import {Pipe} from "./Pipe";
import {default as data} from "../../fixtures/pipes-test.data";

describe("TxPipe Exec Tests", () => {

    it("should intake and output data", (done) => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                expect(`${JSON.stringify(d)}`).toEqual(JSON.stringify(_p.tap()));
                done();
            },
            error: (e) => {
                _sub.unsubscribe();
                done(e);
            },
        });
        _p.write(data);
    });

    it("should transform data with callback", (done) => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                expect(d.length).toEqual(3);
                expect(_p.tap().length).toEqual(3);
                done();
            },
            error: (e) => {
                _sub.unsubscribe();
                done(e);
            }
        });

        _p.write(data);
    });

    it("should not exec until called upon", (done) => {
        const _cb = jest.fn();
        let _cnt = 0;
        const _p = new Pipe(
            async (d) => {
                return Promise.resolve(d);
            }
        );

        const _ivl = setInterval(() => {
            console.log("interval...");
            _p.write("ok");
        }, 10);

        _p.subscribe({
            next: () => {
                // expect(_cb).toBeCalledTimes(1);
                if (++_cnt === 2) {
                    clearInterval(_ivl);
                    done();
                }
                console.log(_cnt);
            },
            error: (e) => {
                done(e);
            }
        });
    });


    it("should stop if a pipe returns false", (done) => {
        const _p = new Pipe(
            ...[
                ..._pipesOrSchemas,
                {
                    exec: () => false,
                }
            ]
        );

        const _sub = _p.subscribe({
            next: () => {
                _sub.unsubscribe();
                done("pipe should not have sent next notification");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error[0].message).toEqual("should be array");
                expect(JSON.stringify(e.data)).toEqual(JSON.stringify(data[0]));
                done();
            },
        });

        _p.write(data[0]);
        setTimeout(done, 200);
    });

    it("should provide errors", (done) => {
        const _p = new Pipe(() => "an error message");
        const _sub = _p.subscribe({
            next: () => {
                _sub.unsubscribe();
                done("pipe should have errored");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error !== void 0).toBe(true);
                done();
            },
            complete: () => {
                done("should not have completed");
            }
        });

        _p.write(data[0]);
    });


    it("should send error if a pipe returns string", (done) => {
        const _eMsg = "an important error message for you";
        const _p = new Pipe(
            _pipesOrSchemas,
            {
                exec: () => _eMsg,
            }
        );
        const _sub = _p.subscribe({
            next: () => {
                _sub.unsubscribe();
                done("pipe should not have sent next notification");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error).toEqual(_eMsg);
                done();
            },
        });

        _p.write(data[0]);
    });
});
