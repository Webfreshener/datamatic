import {Validator} from "./Validator";
import {Pipeline} from "./Pipeline";
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";
import {default as _pipesOrSchemas} from "../../fixtures/pipes-or-schema"

const _schemaDef = {
    "schemas": [
        {
            "$id": "http://api-hero.webfreshener.com/v1/namespace.json#",
            "type": "object",
            "required": [
                "basePath"
            ],
            "properties": {
                "basePath": {
                    "type": "string",
                },
                "servers": {
                    "type": "object"
                },
                "options": {
                    "type": "object"
                },
                "operations": {
                    "$ref": "#/definitions/Operations"
                }
            },
            "definitions": {
                "Operations": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/OperationItem"
                    }
                },
                "OperationItem": {
                    "type": "object",
                    "required": [
                        "operationId",
                        "method",
                        "path"
                    ],
                    "additionalProperties": false,
                    "properties": {
                        "operationId": {
                            "type": "string"
                        },
                        "method": {
                            "type": "string",
                            "enum": [
                                "delete",
                                "get",
                                "head",
                                "options",
                                "patch",
                                "post",
                                "put"
                            ]
                        },
                        "path": {
                            "type": "string"
                        },
                        "request": {
                            "type": "object"
                        },
                        "responses": {
                            "type": "object"
                        }
                    }
                }
            }
        },
        {
            "$id": "http://api-hero.webfreshener.com/v1/namespace/operations.json#",
            // "$schema": "http://api-hero.webfreshener.com/v1/namespace.json#",
            "allOf": [
                {
                    "required": [
                        "elementClass",
                        "target"
                    ],
                    "properties": {
                        "elementClass": {
                            "type": "object"
                        },
                        "target": {
                            "type": "object"
                        }
                    }
                },
                {
                    "$ref": "http://api-hero.webfreshener.com/v1/namespace.json#/definitions/Operations"
                }
            ]
        }
    ],
    "use": "http://api-hero.webfreshener.com/v1/namespace/operations.json#"
};

describe("Pipeline API Tests", () => {
    let _p;
    beforeEach(() => {
        _p = new Pipeline(..._pipesOrSchemas);
    });

    describe("Pipeline Schema", () => {
        it("should accept schema", () => {
            expect(
                () => (new Pipeline(basicCollection))
            ).not.toThrow();
        });

        it("should accept schema config", () => {
            expect(
                () => (new Pipeline(_schemaDef))
            ).not.toThrow();
        });
    });

    describe("Pipeline exec", () => {
        it("should not be an observable", (done) => {
            const _p = new Pipeline(..._pipesOrSchemas);
            _p.subscribe({
                next: () => {
                    done("should not be observable if called with exec");
                },
                error: () => {
                    done("should not be observable if called with exec");
                }
            });

            expect(_p.exec(data).length).toEqual(3);
            expect(Object.keys(_p.tap()).length).toEqual(0);
            setTimeout(() => done(), 10);
        });

        it("should not be a promise", () => {
            expect(_p.exec(data).then).toBeUndefined();
        });

        it("should throw", () => {
            const _p = new Pipeline(..._pipesOrSchemas);
            try {
                _p.exec("invalid value");
            } catch (e) {
                expect(e.error[0].message).toEqual("must be array");
            }
        });
    });

    it("should send error notification if a pipeline returns false", (done) => {
        const _p = new Pipeline(
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
                done("pipeline should not have sent next notification");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error[0].message).toEqual("must be array");
                expect(JSON.stringify(e.data)).toEqual(JSON.stringify(data[0]));
                done();
            },
        });

        _p.write(data[0]);
    });

    it("should provide errors", (done) => {
        const _p = new Pipeline(
            {type: "boolean"});
        const _sub = _p.subscribe({
            next: () => {
                _sub.unsubscribe();
                done("pipeline should have errored");
            },
            error: (e) => {
                _sub.unsubscribe();
                expect(e.error !== void 0).toBe(true);
                done();
            }
        });

        _p.write(data[0]);
    });

    it("should split pipeline", (done) => {
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

        // const _cb = jest.fn();
        let _cnt = 0;
        _p = new Pipeline({
            exec: (d) => d
        });

        _p.subscribe({
            error: done,
        });

        const _split = _p.split(_config);
        expect(_split.length).toEqual(2);

        _split.forEach((pipe) => {
            const _sub = pipe.subscribe({
                next: () => {
                    _cnt++;
                    _sub.unsubscribe();
                },
                error: (e) => {
                    _sub.unsubscribe();
                    throw e;
                }
            });
        });

        _p.write(data);

        setTimeout(() => {
            // expect(_cb).toHaveBeenCalledTimes(2);
            expect(_cnt).toEqual(2);
            expect(_split[0].tap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
            expect(_split[1].tap()[0].age).toEqual(99);
            done();
        }, 50);
    });

    it("should exec multiple pipes inline", (done) => {
        const _p1 = new Pipeline(
            basicCollection,
            (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`}))
        );

        const _p2 = new Pipeline(
            basicCollection,
            (d) => d.map((m) => Object.assign(m, {age: 99}))
        );

        const _inline = _p.pipe(_p1, _p2);

        _inline.subscribe({
            next: (d) => {
                expect(d.length).toEqual(data.length);
                expect(d[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
                expect(d[data.length - 1].age).toEqual(99);
                expect(1).toBeTruthy();
            },
            error: done,
        });

        _inline.write(data);

        setTimeout(() => {
            expect(_inline.tap().length).toEqual(data.length);
            expect(_inline.tap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
            expect(_inline.tap()[data.length - 1].age).toEqual(99);
            expect(1).toBeTruthy();
            done();
            _inline.close();
        }, 50);

    });

    test("pipe", (done) => {
        const _pipe = new Pipeline(
            basicCollection,
            (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`}))
        );

        _pipe.pipe((d) => d).subscribe({
            next: () => done(),
            error: done,
        });

        _pipe.write(data);
    });

    test("yield", () => {
        const _pOS = [
            {
                exec: () => "foo",
            },
            new Pipeline({
                exec: () => "bar",
            }),
            {
                exec: () => "baz",
            },
        ];

        const _ = (new Pipeline(..._pOS)).yield(data);

        expect(_.next().value).toBe("foo");
        expect(_.next().value).toBe("bar");
        expect(_.next().value).toBe("baz");
        expect(_.next().done).toBe(true);
    });

    it("pipeline should pipeline", (done) => {
        const _tx = new Pipeline();

        _tx.subscribe({
            next: (d) => {
                expect(d).toEqual(data);
                done();
            },
            error: (e) => {
                done(e);
            }
        });

        _tx.write(data);
    });

    describe("throttle/clearThrottle", () => {
        test("throttle", (done) => {
            let _cnt = 0;
            const rate = 150;
            const _sub = _p.throttle(rate).subscribe(() => _cnt++);
            data.forEach((d) => {
                _p.write([d]);
            });

            expect(_p.errors).toEqual(null);

            const _ivl = setInterval(() => {
                if (_cnt === data.length) {
                    _p.clearThrottle();
                    clearInterval(_ivl);
                    expect(_p.tap().length).toEqual(1);
                    expect(_p.tap()[0].hasOwnProperty("name")).toBeTruthy();
                    expect(_p.tap()[0].name).toEqual(data[data.length - 1].name);
                    _sub.unsubscribe();
                    done();
                } else {
                    done(`did not receive all data via throttle\nexpected: ${data.length}\nreceived: ${_cnt}\n`);
                }
            }, (data.length * rate) + 10);
        });

        test.skip("clearThrottle", (done) => {
            let _cnt = 0;
            const rate = 150;
            const _sub = _p.throttle(rate).subscribe({
                next: (d) => {
                    _p.clearThrottle();
                    _cnt++;
                },
                error: done,
            });

            const _ivl = setInterval(() => {
                if (_cnt === 1) {
                    expect(Array.isArray(_p.tap())).toBeTruthy();
                    expect(_p.tap().length).toEqual(1);
                    expect(typeof _p.tap()[0]).toBe("object");
                    expect(_p.tap()[0].name).toBe("Alice");
                    clearInterval(_ivl);
                    _sub.unsubscribe();
                    done();
                } else {
                    done(`did not receive correct data via throttle\nexpected: 1\nreceived: ${_cnt}\n`);
                }
            }, rate);

            data.forEach((d) => {
                _p.write([d]);
            });
        })
    });

    test("sample", () => {
        const _cb = jest.fn();
        _p.sample(3).subscribe({
            next: () => _cb(),
            error: console.log,
        });

        data.slice(0, 4).forEach((m) => {
            _p.write([m]);
        });

        expect(_cb).toHaveBeenCalledTimes(1);
    });

    test("clone", () => {
        let _cnt = 0;

        const _h = () => _cnt++;

        const _sub1 = _p.subscribe(_h);

        const _clone = _p.clone();

        const _sub2 = _clone.subscribe(_h);

        _clone.write(data);
        expect(_cnt).toEqual(2);

        _cnt = 0;

        _sub1.unsubscribe();
        _sub2.unsubscribe();
    });

    describe("link / unlink", () => {

        beforeAll(() => {

        });

        it("should link pipeline", () => {

        });

        it("should unlink pipeline", () => {

        });
    });

    test("should link and unlink pipes", () => {
        const _cb = jest.fn();
        const _TxValidator = new Validator({schemas: [basicCollection]});
        const _link = new Pipeline(_TxValidator, {schemas: [basicCollection]});

        _p.link(_link, (d) => {
            _cb();
            return d;
        });

        _p.write(data);
        expect(_p.errors).toEqual(null);
        expect(_cb).toHaveBeenCalledTimes(1);

        // we capture state for comparison
        const _state = `${_p}`;

        expect(`${_link}`).toEqual(`${_state}`);
        expect(`${_link}` === `${_p}`).toBe(true);

        _p.unlink(_link);

        // this will add an item to _p but not to _link
        _p.write([
            ..._p.tap(),
            {
                name: "Added Item",
                active: true,
                age: 100,
            }
        ]);

        expect(_p.errors).toEqual(null);

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
                _p.close();
                _cb();
            },
            error: (e) => {
                _sub.unsubscribe();
                throw e;
            },
        });

        data.forEach((d) => {
            _p.write(Array.isArray(_p.tap()) ? [..._p.tap(), d] : [d]);
        });

        expect(_p.errors).toEqual(null);
        expect(_p.tap().length).toEqual(1);
        expect(_cb).toHaveBeenCalledTimes(1);
        expect(_p.writable).toBe(false);
        _sub.unsubscribe();
    });


    it("should merge multiple pipes into a single output", (done) => {
        const _vo = {
            schema: _pipesOrSchemas[0].schema,
        };

        const _p1 = new Pipeline({
            schema: _vo.schema,
            exec: (d) => d.map((m) => Object.assign(m, {name: `${m.name} RENAMED`})),
        });

        const _p2 = new Pipeline({
                schema: _vo.schema,
                exec: (d) => d.map((m) => Object.assign(m, {age: 99}))
            }
        );

        const _merged = _p.merge([_p1, _p2], {
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
                    expect(_merged.tap()[0].name.match(/.*\sRENAMED+$/)).toBeTruthy();
                    expect(_merged.tap()[data.length - 1].name.match(/.*\sRENAMED+$/)).toBeTruthy();
                    _p2.write(data);
                } else {
                    expect(_merged.tap().length).toEqual(data.length);
                    expect(_merged.tap()[0].age).toEqual(99);
                    expect(_merged.tap()[data.length - 1].age).toEqual(99);
                    done();
                }
            }
        });

        _p1.write(data);
    });

});
