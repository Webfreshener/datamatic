import {RxVO} from "./rxvo";
import {TxPipe} from "./txPipe";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";
import {pipe} from "rxjs";

jest.useFakeTimers();

describe("TxPipes tests", () => {
    let _p;
    let _vo;

    beforeEach(() => {
        _vo = new RxVO({schemas: [basicCollection]});
        _p = new TxPipe(_vo, [{
            schema: basicCollection,
            callback: (d) => d.filter((itm) => itm.active),
        }]);
    });

    it("should provide a schema", () => {
        expect(JSON.stringify(_p.txSchema)).toEqual(JSON.stringify(basicCollection));
    });

    it("should intake and output data", (done) => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                expect(`${d}`).toEqual(JSON.stringify(_p.txTap()));
                expect(`${d}`).toEqual(JSON.stringify(_p.toJSON()));
                expect(`${d}`).toEqual(_p.toString());
                done();
            },
            error: (e) => {
                _sub.unsubscribe();
                done(e);
            },
        });

        _p.txWrite(data);
    });

    it("should provide errors", () => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                done("pipe should have errored");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(_p.txErrors !== null).toBe(true);
                done();
            },
        });

        _p.txWrite(data[0]);
    });

    it("should transform data with callback", (done) => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                expect(d.model.length).toEqual(3);
                expect(_p.txTap().length).toEqual(3);
                done();
            },
            error: (e) => {
                _sub.unsubscribe();
                done(e);
            }
        });

        _p.txWrite(data);
    });

    it("should split pipe", () => {
        const _config = [
            {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
            },
            {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {age: 99})),
            },
        ];

        const _cb = jest.fn();

        const _split = _p.txSplit(_config);
        _split.forEach((pipe) => {
            pipe.subscribe(_cb);
        });

        _p.txWrite(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(2);
        expect(_split[0].txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_split[1].txTap()[0].age).toEqual(99);
    });

    it("should exec multiple pipes inline", () => {
        const _p1 = new TxPipe(
            new RxVO({schemas: [_vo.schema]}),
            [{
                schema: Object.assign({}, _vo.schema),
                callback: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
            }]);

        const _p2 = new TxPipe(
            new RxVO({schemas: [_vo.schema]}),
            [{
                schema: Object.assign({}, _vo.schema),
                callback: (d) => d.map((m) => Object.assign(m, {age: 99})),
            }]);

        const _inline = _p.txPipe(_p1, _p2);

        _inline.txWrite(data);

        expect(JSON.stringify(_inline.txSchema)).toEqual(JSON.stringify(_vo.schema));
        expect(_inline.txTap().length).toEqual(data.length);
        expect(_inline.txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_inline.txTap()[0].age).toEqual(99);
        expect(_inline.txTap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_inline.txTap()[data.length - 1].age).toEqual(99);

    });

    it("should merge multiple pipes into a single output", () => {
        const _p1 = new TxPipe(
            new RxVO({schemas: [_vo.schema]}), {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
            });

        const _p2 = new TxPipe(
            new RxVO({schemas: [_vo.schema]}), {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {age: 99}))
            }
        );

        const _merged = _p.txMerge([_p1, _p2], _vo.schema, (d) => {
            return d.map((m) => Object.assign(m, {active: false}));
        });

        const _cb = jest.fn();
        _merged.subscribe(_cb);

        _p1.txWrite(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(1);

        expect(_merged.txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_merged.txTap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();

        _p2.txWrite(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(2);

        expect(_merged.txTap().length).toEqual(data.length);
        expect(_merged.txTap()[0].age).toEqual(99);
        expect(_merged.txTap()[data.length - 1].age).toEqual(99);
    });

    it("should close", () => {
        const _sub = _p.subscribe({
            next: () => {
                // will close on first invocation
                _p.txClose();
            },
        });

        data.forEach((d) => {
            _vo.model.push(d);
        });

        expect(_p.txTap().length).toEqual(1);
        expect(_p.txWritable).toBe(false);
    });

    it("should exec and not modify contents", () => {
        expect(_p.exec(data).length).toEqual(3);
        expect(_p.txTap().length).toEqual(0);
    });


    it("should limit occurrences of callback to single instance", () => {
        const _cb = jest.fn();
        let _cnt = 0;
        const _sub = _p.txOnce().subscribe({
            next: (d) => {
                _cnt++;
                _cb();

                if (_cnt === 1) {
                    _vo.model = data;
                }

                expect(d.model.length).toEqual(3);
            },
            error: (e) => {
                _sub.unsubscribe();
                done(e);
            }
        });

        _vo.model = data;

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(1);
    });

    it("should work with Promises", (done) => {
        _p.txPromise(data).then((res) => {
            expect(res.model.length).toEqual(3);
            done();
        }, done).catch(done);
    });

    it("should throttle notifications based on time interval", () => {
        let _cnt = 0;
        const _sub = _p.txThrottle(150).subscribe({
            next: (d) => {
                if ((++_cnt) <= 3) {
                    _vo.model.push({
                        name: `New Item ${_cnt}`,
                        active: true,
                        age: _cnt,
                    });
                }
            },
        });

        _vo.model = data;

        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(1);
        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(2);
        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(4);
        expect(_p.txTap().length).toEqual(6);
        _sub.unsubscribe();
    });

    it("should sample pipe data", () => {
        let _cnt = 0;
        _p.txSample(3).subscribe({
            next: () => {
                _cnt++;
            },
            error: console.log,
        });

        _p.txWrite(data);
        _p.txWrite(data);
        _p.txWrite(data);
        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(1);
    });

    it("should clone existing `pipe`", () => {
        let _cnt = 0;

        const _h = () => _cnt++;

        _p.subscribe(_h);
        _p.txClone().subscribe(_h);

        _vo.model = data;

        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(2);
    });

    it("should link and unlink pipes", () => {
        const _cb = jest.fn();
        const _rxvo = new RxVO({schemas: [basicCollection]});
        const _link = new TxPipe(_rxvo, basicCollection);

        _p.txLink(_link, [(d) => {
            (() => _cb())();
            return d;
        }]);

        jest.advanceTimersByTime(100);

        _vo.model = data;

        expect(_cb).toHaveBeenCalledTimes(1);


        jest.advanceTimersByTime(100);

        // we capture state for comparison
        const _state = `${_p}`;

        expect(`${_link}`).toEqual(`${_state}`);
        expect(`${_link}` === `${_p}`).toBe(true);

        _p.txUnlink(_link);

        // this will add an item to _p but not to _link
        _vo.model.push({
            name: "Added Item",
            active: true,
            age: 100,
        });

        // we expect to discover no further executions and the state to be unchanged
        expect(_cb).toHaveBeenCalledTimes(1);
        expect(`${_link}`).toEqual(`${_state}`);
        expect(`${_link}` === `${_p}`).toBe(false);
    });
});
