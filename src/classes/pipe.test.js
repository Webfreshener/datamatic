import {RxVO} from "./rxvo";
import {Pipe} from "./pipe";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";
import {pipe} from "rxjs";

jest.useFakeTimers();

describe("Pipes tests", () => {
    let _p;
    let _vo;

    beforeEach(() => {
        _vo = new RxVO({schemas: [basicCollection]});
        _p = new Pipe(_vo, [{
            schema: basicCollection,
            callback: (d) => d.filter((itm) => itm.active),
        }]);
    });

    it("should provide a schema", () => {
        expect(JSON.stringify(_p.schema)).toEqual(JSON.stringify(basicCollection));
    });

    it("should intake and output data", (done) => {
        const _sub = _p.subscribe({
            next: (d) => {
                _sub.unsubscribe();
                expect(`${d}`).toEqual(JSON.stringify(_p.tap()));
                expect(`${d}`).toEqual(JSON.stringify(_p.toJSON()));
                expect(`${d}`).toEqual(_p.toString());
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
                expect(d.model.length).toEqual(3);
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

        const _split = _p.split(_config);
        _split.forEach((pipe) => {
            pipe.subscribe(_cb);
        });

        _p.write(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(2);
        expect(_split[0].tap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_split[1].tap()[0].age).toEqual(99);
    });

    it("should exec multiple pipes inline", () => {
        const _p1 = new Pipe(
            new RxVO({schemas: [_vo.schema]}),
            [{
                schema: Object.assign({}, _vo.schema),
                callback: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
            }]);

        const _p2 = new Pipe(
            new RxVO({schemas: [_vo.schema]}),
            [{
                schema: Object.assign({}, _vo.schema),
                callback: (d) => d.map((m) => Object.assign(m, {age: 99})),
            }]);

        const _inline = _p.pipe(_p1, _p2);

        _inline.write(data);

        console.log(_inline.tap());
        expect(JSON.stringify(_inline.schema)).toEqual(JSON.stringify(_vo.schema));
        expect(_inline.tap().length).toEqual(data.length);
        expect(_inline.tap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_inline.tap()[0].age).toEqual(99);
        expect(_inline.tap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_inline.tap()[data.length - 1].age).toEqual(99);

    });

    it("should merge multiple pipes into a single output", () => {
        const _p1 = new Pipe(
            new RxVO({schemas: [_vo.schema]}), {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
            });

        const _p2 = new Pipe(
            new RxVO({schemas: [_vo.schema]}), {
                schema: _vo.schema,
                callback: (d) => d.map((m) => Object.assign(m, {age: 99}))
            }
        );

        const _merged = _p.merge([_p1, _p2], _vo.schema, (d) => {
            return d.map((m) => Object.assign(m, {active: false}));
        });

        const _cb = jest.fn();
        _merged.subscribe(_cb);

        _p1.write(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(1);

        expect(_merged.tap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
        expect(_merged.tap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();

        _p2.write(data);

        jest.advanceTimersByTime(100);
        expect(_cb).toHaveBeenCalledTimes(2);

        expect(_merged.tap().length).toEqual(data.length);
        expect(_merged.tap()[0].age).toEqual(99);
        expect(_merged.tap()[data.length - 1].age).toEqual(99);
    });

    it("should close", () => {
        const _sub = _p.subscribe({
            next: () => {
                // will close on first invocation
                _p.close();
            },
        });

        data.forEach((d) => {
            _vo.model.push(d);
        });

        expect(_p.tap().length).toEqual(1);
        expect(_p.isWritable).toBe(false);
    });

    it("should exec and not modify contents", () => {
        expect(_p.exec(data).length).toEqual(3);
        expect(_p.tap().length).toEqual(0);
    });


    it("should limit occurrences of callback to single instance", () => {
        const _cb = jest.fn();
        let _cnt = 0;
        const _sub = _p.once().subscribe({
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

    it("should throttle notifications based on time interval", () => {
        let _cnt = 0;
        const _sub = _p.throttle(150).subscribe({
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
        console.log(_p.tap());
        expect(_p.tap().length).toEqual(6);
        _sub.unsubscribe();
    });

    it("should sample pipe data", () => {
        let _cnt = 0;
        _p.sample(3).subscribe({
            next: () => {
                _cnt++;
            },
            error: console.log,
        });

        _p.write(data);
        _p.write(data);
        _p.write(data);
        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(1);
    });

    it("should clone existing `pipe`", () => {
        let _cnt = 0;

        const _h = () => _cnt++;

        _p.subscribe(_h);
        _p.clone().subscribe(_h);

        _vo.model = data;

        jest.advanceTimersByTime(200);
        expect(_cnt).toEqual(2);
    });

    it("should link and unlink pipes", () => {
        const _cb = jest.fn();
        const _rxvo = new RxVO({schemas: [basicCollection]});
        const _link = new Pipe(_rxvo, basicCollection);

        _p.link(_link, [(d) => {
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

        _p.unlink(_link);

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
