import {Validator} from "./Validator";
import {Pipe} from "./Pipe";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";
import {default as _pipesOrSchemas} from "../../fixtures/pipes-or-schema"

describe("TxPipe API Tests", () => {
    let _p;
    beforeEach(() => {
        _p = new Pipe(..._pipesOrSchemas);
    });

    test("TxPipe schema", () => {
        const _p = (new Pipe(..._pipesOrSchemas)).txSchemas;
        expect(JSON.stringify(_p[0])).toEqual(
            JSON.stringify(_pipesOrSchemas[0])
        );
    });

    describe("TxPipe exec", () => {
        it("should not be an observable", (done) => {
            const _p = new Pipe(..._pipesOrSchemas);
            _p.subscribe({
                next: () => {
                    done("should not be observable if called with exec");
                },
                error: () => {
                    done("should not be observable if called with exec");
                }
            });

            expect(_p.exec(data).length).toEqual(3);
            expect(Object.keys(_p.txTap()).length).toEqual(0);
            setTimeout(() => done(), 10);
        });

        it("should not be a promise", () => {
            expect(_p.exec(data).then).toBeUndefined();
        });

        it("should throw", () => {
            const _p = new Pipe(..._pipesOrSchemas);
            try {
                _p.exec("invalid value");
            } catch (e) {
                expect(e.error[0].message).toEqual("should be array");
            }
        });
    });

    it("should send error notification if a pipe returns false", (done) => {
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

        _p.txWrite(data[0]);
    });

    it("should provide errors", (done) => {
        const _p = new Pipe(
            {type: "boolean"});
        const _sub = _p.subscribe({
            next: () => {
                _sub.unsubscribe();
                done("pipe should have errored");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error !== void 0).toBe(true);
                done();
            }
        });

        _p.txWrite(data[0]);
    });

    it("should split pipe", () => {
        const _config = [
            {
                exec: (d) => {
                    return d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`}))
                },
            },
            {
                exec: (d) => d.map((m) => Object.assign(m, {age: 99})),
            },
        ];

        const _cb = jest.fn();
        _p = new Pipe({
            exec: (d) => d
        });

        const _split = _p.txSplit(_config);
        expect(_split.length).toEqual(2);

        _split.forEach((pipe) => {
            const _sub = pipe.subscribe({
                next: () => {
                    _cb();
                    _sub.unsubscribe();
                },
                error: (e) => {
                    _sub.unsubscribe();
                    throw e;
                }
            });
        });

        setTimeout(() => {
            _p.txWrite(data);
            expect(_cb).toHaveBeenCalledTimes(2);
            expect(_split[0].txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
            expect(_split[1].txTap()[0].age).toEqual(99);
        }, 50);
    });

    it("should exec multiple pipes inline", () => {
        const _p1 = new Pipe({
            schema: basicCollection,
            exec: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
        });

        const _p2 = new Pipe({
            schema: basicCollection,
            exec: (d) => d.map((m) => Object.assign(m, {age: 99})),
        });

        const _inline = _p.txPipe(_p1, _p2);

        _inline.txWrite(data);

        setTimeout(() => {
            expect(JSON.stringify(_inline.txSchemas[0].schemas[0].schema)).toEqual(JSON.stringify(basicCollection));
            expect(_inline.txTap().length).toEqual(data.length);
            expect(_inline.txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
            expect(_inline.txTap()[0].age).toEqual(99);
            expect(_inline.txTap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
            expect(_inline.txTap()[data.length - 1].age).toEqual(99);
            _inline.txClose();
        }, 0);

    });

    test("txYield", () => {
        const _pOS = [
            {
                exec: () => "foo",
            },
            new Pipe({
                exec: () => "bar",
            }),
            {
                exec: () => "baz",
            },
        ];

        const _ = (new Pipe(..._pOS)).txYield(data);

        expect(_.next().value).toBe("foo");
        expect(_.next().value).toBe("bar");
        expect(_.next().value).toBe("baz");
        expect(_.next().done).toBe(true);
    });

    it("pipe should pipe", (done) => {
        const _tx = new Pipe();

        _tx.subscribe({
            next: (d) => {
                expect(d).toEqual(data);
                done();
            },
            error: (e) => {
                done(e);
            }
        });

        _tx.txWrite(data);
    });

    test("txThrottle", () => {
        const _cb = jest.fn();
        const _sub = _p.txThrottle(150).subscribe(() => _cb());
        data.forEach((d) => {
            _p.txWrite([d]);
        });

        expect(_p.txErrors).toEqual(null);
        let _cnt = 0;
        const _ivl = setInterval(() => {
            expect(_cb).toHaveBeenCalledTimes(_cnt++);
            if (_cnt === data.length) {
                clearInterval(_ivl);
                _sub.unsubscribe();
            }
        }, 151);
    });

    test("txSample", () => {
        const _cb = jest.fn();
        _p.txSample(3).subscribe({
            next: () => _cb(),
            error: console.log,
        });

        data.slice(0, 4).forEach((m) => {
            _p.txWrite([m]);
        });

        expect(_cb).toHaveBeenCalledTimes(1);
    });

    test("txClone", () => {
        let _cnt = 0;

        const _h = () => _cnt++;

        const _sub1 = _p.subscribe(_h);

        const _clone = _p.txClone();

        const _sub2 = _clone.subscribe(_h);

        _clone.txWrite(data);
        expect(_cnt).toEqual(2);

        _cnt = 0;

        _sub1.unsubscribe();
        _sub2.unsubscribe();
    });

    describe("txLink / txUnlink", () => {

        beforeAll(() => {

        });

        it("should link pipe", () => {

        });

        it("should unlink pipe", () => {

        });
    });

    test("should link and unlink pipes", () => {
        const _cb = jest.fn();
        const _TxValidator = new Validator({schemas: [basicCollection]});
        const _link = new Pipe(_TxValidator, {schemas: [basicCollection]});

        _p.txLink(_link, (d) => {
            _cb();
            return d;
        });

        _p.txWrite(data);
        expect(_p.txErrors).toEqual(null);
        expect(_cb).toHaveBeenCalledTimes(1);

        // we capture state for comparison
        const _state = `${_p}`;

        expect(`${_link}`).toEqual(`${_state}`);
        expect(`${_link}` === `${_p}`).toBe(true);

        _p.txUnlink(_link);

        // this will add an item to _p but not to _link
        _p.txWrite([
            ..._p.txTap(),
            {
                name: "Added Item",
                active: true,
                age: 100,
            }
        ]);

        expect(_p.txErrors).toEqual(null);

        // we expect to discover no further executions and the state to be unchanged
        expect(_cb).toHaveBeenCalledTimes(1);
        expect(`${_link}`).toEqual(`${_state}`);
        expect(`${_link}` === `${_p}`).toBe(false);
    });

    it("should close", () => {
        const _cb = jest.fn();
        const _sub = _p.subscribe({
            next: () => {
                // will close on first invocation
                _p.txClose();
                _cb();
            },
            error: (e) => {
                _sub.unsubscribe();
                throw e;
            },
        });

        data.forEach((d) => {
            _p.txWrite(Array.isArray(_p.txTap()) ? [..._p.txTap(), d] : [d]);
        });

        expect(_p.txErrors).toEqual(null);
        expect(_p.txTap().length).toEqual(1);
        expect(_cb).toHaveBeenCalledTimes(1);
        expect(_p.txWritable).toBe(false);
        _sub.unsubscribe();
    });


    it("should merge multiple pipes into a single output", (done) => {
        const _vo = {
            schema: _pipesOrSchemas[0].schema,
        };

        const _p1 = new Pipe({
            schema: _vo.schema,
            exec: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
        });

        const _p2 = new Pipe({
                schema: _vo.schema,
                exec: (d) => d.map((m) => Object.assign(m, {age: 99}))
            }
        );

        const _merged = _p.txMerge([_p1, _p2], {
            schema: _vo.schema,
            exec: (d) => d.map(
                (m) => Object.assign(m, {active: false})
            )
        });

        let _cnt = 0;
        _merged.subscribe({
            next: (d) => {
                if (!_cnt) {
                    _cnt++;
                    expect(_merged.txTap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
                    expect(_merged.txTap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
                    _p2.txWrite(data);
                } else {
                    expect(_merged.txTap().length).toEqual(data.length);
                    expect(_merged.txTap()[0].age).toEqual(99);
                    expect(_merged.txTap()[data.length - 1].age).toEqual(99);
                    done();
                }
            }
        });

        _p1.txWrite(data);
    });

});
