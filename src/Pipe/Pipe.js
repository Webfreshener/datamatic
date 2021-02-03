/* ############################################################################
The MIT License (MIT)

Copyright (c) 2019 Van Schroeder
Copyright (c) 2019 Webfreshener, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

############################################################################ */
import {_observers, Validator} from "./Validator";
import {fill, mapArgs} from "./Utils";
import {Executor} from "./Executor";
import {default as DefaultVOSchema} from "../schemas/default-pipe-vo.schema";
import {Properties} from "./Properties";

const _pipes = new WeakMap();
const _cache = new WeakMap();

/**
 * TxPipe Class
 */
export class Pipe {
    static getExecs(..._pvs) {
        return _pvs.map((_p) => {
            _p = Array.isArray(_p) ? _p[0] : _p;
            return (d) => {
                const _exec = ((typeof _p === "function") ? _p : void 0) ||
                    // is pipe or implements pipe api
                    (_p["exec"]) ||
                    // is validator or implements validator api
                    (_p["validate"] ? ((d) => _p["validate"](d) ? d : false) : void 0) ||
                    // default
                    ((_) => _);
                return (_exec).apply(null, [d]);
            };
        });
    }

    /**
     *
     * @param pipesOrVOsOrSchemas
     */
    constructor(...pipesOrVOsOrSchemas) {
        _pipes.set(this, {});
        _cache.set(this, []);

        // TODO: solve this issue with async methods to remove kludge
        if (pipesOrVOsOrSchemas[0] instanceof Function) {
            pipesOrVOsOrSchemas.splice(0, 0, DefaultVOSchema);
        }

        pipesOrVOsOrSchemas = mapArgs(...pipesOrVOsOrSchemas);

        // enforces 2 callback minimum for `reduce` by appending pass-thru callbacks
        const _callbacks = fill(Pipe.getExecs(...pipesOrVOsOrSchemas));

        const _inPipe = (
            Array.isArray(pipesOrVOsOrSchemas) && pipesOrVOsOrSchemas.length
        ) ? pipesOrVOsOrSchemas[0] : pipesOrVOsOrSchemas.length ?
            pipesOrVOsOrSchemas : {
                schema: [DefaultVOSchema, DefaultVOSchema],
                exec: (d) => d,
            };

        const _pSchemas = [...pipesOrVOsOrSchemas]
            .filter((_p) => {
                // filters array for validators and valid schemas
                return (
                    // returns true if TxValidator
                    (_p instanceof Validator) ||
                    // returns true if has `schema` attribute and is a valid `json-schema`
                    _p["schema"] && Validator.validateSchemas(_p.schema)
                );
            }).map(_ => _.schema);

        const _getInSchema = () => {
            if (_pSchemas.length) {
                return (_pSchemas[0] instanceof Validator) ?
                    _pSchemas[0].schema : _pSchemas[0];
            }
            return DefaultVOSchema;
        };

        const _inSchema = _getInSchema();
        const _outSchema = _pSchemas.length > 1 ? _pSchemas[_pSchemas.length - 1] : _inSchema;

        if (!_pSchemas.length) {
            _pSchemas.splice(0, 0, {schemas: [DefaultVOSchema]}, {schemas: [DefaultVOSchema]});
        }

        // stores config & state
        _pipes.set(this,
            Properties.init(this, {
                vo: (_inPipe instanceof Validator) ? _inPipe : new Validator(_inSchema),
                callbacks: _callbacks,
                txSchemas: _pSchemas,
                inSchema: _inSchema,
                outSchema: _outSchema,
                pOS: pipesOrVOsOrSchemas,
                _pipes: _pipes,
            }),
        );

        _pipes.get(this).ivl = 0;
        _pipes.get(this).ivlVal = 0;
        _pipes.get(this).listeners = [new PipeListener(this)];

        // define exec in constructor to ensure method visibility
        Object.defineProperty(this, "exec", {
            // value: (data) => _pipes.get(this).exec(data),
            value: (data) => {
                return _pipes.get(this).exec(data);
            },
            enumerable: true,
            configurable: false,
        });
    }

    /**
     * Creates new `txPipe` segment
     * @param pipesOrSchemas
     * @returns {Pipe}
     */
    txPipe(...pipesOrSchemas) {
        return new Pipe([_pipes.get(this).out, ...pipesOrSchemas]);
    }

    /**
     * Returns arr
     * @returns {*[]}
     */
    get schema() {
        return [
            _pipes.get(this).vo.schema,
            _pipes.get(this).out.schema
        ];
    }

    /**
     * links pipe segment to direct output to target pipe
     * @param target
     * @param callbacks function[]
     * @returns {Pipe}
     */
    txLink(target, ...callbacks) {
        if (!(target instanceof Pipe)) {
            throw `item for "target" was not a TxPipe`;
        }

        // allow for array literal in place of inline assignment
        if (Array.isArray(callbacks[0])) {
            callbacks = callbacks[0];
        }

        callbacks = fill(callbacks || []);

        // creates observer and stores it to links map for `txPipe`
        const _sub = this.subscribe({
            next: (data) => {
                const _res = Executor.exec(callbacks, data.toJSON ? data.toJSON() : data);
                if (_res instanceof Promise) {
                    return _res.then((_) => target.txWrite(_));
                }

                target.txWrite(_res);
            },
            error: (e) => {
                console.error(e);
            },
            // handles unlink & cleanup on complete
            complete: () => this.txUnlink(target)
        });

        _pipes.get(this).links.set(target, _sub);
        return this;
    }

    /**
     * Unlink `txPipe` segment from target `txPipe`
     * @param target
     * @returns {Pipe}
     */
    txUnlink(target) {
        if (!(target instanceof Pipe)) {
            throw `item for "target" was not a TxPipe`;
        }

        const _sub = _pipes.get(this).links.get(target);

        if (_sub) {
            _sub.unsubscribe();
            _pipes.get(this).links.delete(target);
        }

        return this;
    }

    /**
     * Returns validation errors
     * @returns {*}
     */
    get txErrors() {
        return _pipes.get(this).vo.errors;
    }

    /**
     * Returns JSON-SCHEMA for `txPipe` output
     * @returns {object}
     */
    get txSchemas() {
        return [..._pipes.get(this).txSchemas];
    }

    /**
     * Creates array of new `txPipe` segments that run in parallel
     * @param schemasOrPipes
     * @returns {*}
     */
    txSplit(schemasOrPipes) {
        return schemasOrPipes.map((_) => this.txPipe(_));
    }

    /**
     * Iterates pipe callbacks via generator function
     * @param data
     * @returns {generator}
     */
    txYield(data) {
        let _fill = _pipes.get(this).pOS.map((_) => _.exec || ((_) => _));

        if (!_fill.length) {
            _fill[0] = (d) => d;
        }

        const _f = new Function("$scope", "$cb",
            [
                "return (function* (data) { ",
                "try {",
                Object.keys(_fill)
                    .map((_) => `yield data=($cb[${_}].bind($scope))(data)`)
                    .join("; "),
                "} catch (e) { $scope.error(e); }",
                "}).bind($scope);",
            ].join(" ")
        );

        return _f(this, _fill)(data);
    }

    /**
     * Merges multiple pipes into single output
     * @param pipeOrPipes
     * @param pipeOrSchema
     * @returns {Pipe}
     */
    txMerge(pipeOrPipes, pipeOrSchema = {schemas: [DefaultVOSchema]}) {
        const _out = new Pipe(pipeOrSchema);
        _pipes.get(this).listeners = [
            ..._pipes.get(this).listeners,
            // -- feeds output of map to listeners array
            ...(Array.isArray(pipeOrPipes) ? pipeOrPipes : [pipeOrPipes])
                .filter((_p) => ((typeof _p.subscribe) === "function"))
                .map((_p) => {
                    _p.subscribe((d) => {
                        // -- all pipes now write to output tx
                        _out.txWrite(d.toJSON ? d.toJSON() : d);
                    });
                    return _p;
                })
        ];
        // -- returns output tx for observation
        return _out;
    }

    /**
     * Writes data to pipe segment
     * @param data
     * @returns {Pipe}
     */
    txWrite(data) {
        _pipes.get(this).vo.model = data;
        return this;
    }

    /**
     * Creates clone of current `txPipe` segment
     * @returns {Pipe}
     */
    txClone() {
        const $ref = _pipes.get(this);
        const _cz = class extends Pipe {
            constructor() {
                super();
                _pipes.set(this, $ref);
                _pipes.get(this).listeners = [...$ref.listeners];
            }
        };
        return new _cz();
    }

    /**
     * Terminates input on `txPipe` segment. This is irrevocable
     * @returns {Pipe}
     */
    txClose() {
        _pipes.get(this).out.freeze();
        return this;
    }

    /**
     * Returns write status of `txPipe`
     * @returns {boolean}
     */
    get txWritable() {
        return !_pipes.get(this).out.isFrozen;
    }

    /**
     * Informs `txPipe` to rate limit notifications based on time interval
     * @param rate
     * @returns {Pipe}
     */
    txThrottle(rate) {
        const _ivl = _pipes.get(this).tO;

        if (_ivl) {
            _ivl.clearInterval();
        }

        if (rate >= 0) {
            _pipes.get(this).tO = setInterval(
                () => {
                    if (_cache.get(this).length) {
                        const _func = _cache.get(this).pop();
                        if ((typeof _func) === "function") {
                            _pipes.get(this).out.model = _func();
                        }
                    }
                    delete _pipes.get(this).tO;
                },
                parseInt(rate, 10)
            );
        }
        return this;
    }

    /**
     * Returns product of Nth occurrence of `txPipe` execution
     * @param nth
     * @returns {Pipe}
     */
    txSample(nth) {
        _pipes.get(this).ivl = nth;
        return this;
    }

    /**
     * Subscribes to `txPipe` output notifications
     * @param handler
     * @returns {Observable}
     */
    subscribe(handler) {
        if (!(typeof handler).match(/^(function|object)$/)) {
            throw "handler required for TxPipe::subscribe";
        }

        return _pipes.get(this).out.subscribe(handler);
    }

    /**
     * Provides current state of `txPipe` output. alias for toJSON
     * @returns {Object|Array}
     */
    txTap() {
        return this.toJSON();
    }

    /**
     * Convenience Method for Promise based flows.
     * Writes data to `txPipe` and wraps observer in Promise
     *
     * @param data
     * @returns {Promise<Pipe>}
     */
    async txPromise(data) {
        return await new Promise((resolve, reject) => {
            this.subscribe({
                next: (d) => {
                    resolve(d);
                },
                error: (e) => {
                    reject(e);
                }
            });
            this.txWrite(data);
        });
    }

    /**
     * Overrides Object's toString method
     * @override
     * @returns {String}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Provides current state of `txPipe` output.
     * @override
     * @returns {Object|Array}
     */
    toJSON() {
        return _pipes.get(this).out.toJSON();
    }
}

export class PipeListener {
    /**
     *
     * @param target
     */
    constructor(target) {
        const _self = this;
        _pipes.set(_self, target);
        this.vo.subscribe({
            next: (d) => _self.next(d),
            error: (e) => _self.error(e),
            complete: () => _self.complete(),
        });
    }

    /**
     *
     * @returns {Pipe}
     */
    get target() {
        return _pipes.get(this);
    }

    /**
     *
     * @returns {Validator}
     */
    get vo() {
        return _pipes.get(this.target).vo;
    }

    /**
     *
     * @returns {Validator}
     */
    get out() {
        return _pipes.get(this.target).out;
    }

    /**
     *
     * @param e
     */
    error(e) {
        // sends error notification through out validator's observable
        _observers.get(this.out).error(e);
    }

    /**
     * closes `pipe` on complete notification
     */
    complete() {
        this.target.txClose();
    }

    /**
     *
     * @param data
     * @returns {Promise<void | never>}
     */
    next(data) {
        // enforces JSON formatting if feature is present
        data = data && data.toJSON ? data.toJSON() : data;
        const _target = _pipes.get(this);
        // tests for presence of rate-limit timeout
        if (_pipes.get(_target).tO) {
            // caches operation for later execution. ordering is FIFO
            _cache.get(_target).splice(0, 0, () => _pipes.get(_target).cb(data));
            // cancels current execution
            return void 0;
        }

        // tests for interval (ivl)
        if (_pipes.get(_target).ivl !== 0) {
            // tics the counter and tests if count is fulfilled
            if ((++_pipes.get(_target).ivlVal) !== _pipes.get(_target).ivl) {
                // count is not fulfilled. stops the execution
                return void 0;
            } else {
                // resets the count and lets the operation proceed
                _pipes.get(_target).ivlVal = 0;
            }
        }

        let _t, _type;
        const _out = (_) => {
            // else we set the model for validation
            try {
                this.out.model = _.toJSON ? _.toJSON() : _;
            } catch (e) {
                _observers.get(this.out).error({
                    error: e,
                    data: data,
                });
            }
        };

        // capture output of callback
        try {
            _t = _pipes.get(this).exec(data); //_pipes.get(_pipes.get(this)).exec(data);
            _type = typeof _t;
        } catch (e) {
            return _observers.get(this.out).error({
                error: e,
                data: data,
            });
        }

        // tests if object and if object is writable
        if ((_t instanceof Promise) || ((_type === "function") || (_type === "object")) && _target.txWritable) {
            if (_t instanceof Promise) {
                return _t.then((_) => {
                    _out(_)
                })
                    .catch((e) => {
                        _observers.get(this.out).error({
                            error: e,
                            data: data,
                        });
                    });
            }

            if (_type === "function") {
                const __ = _t();
                if (__ instanceof Promise) {
                    return __.then((_) => {
                        _out(_)
                    }).catch((e) => {
                        _observers.get(this.out).error({
                            error: e,
                            data: data,
                        });
                    });
                }
            }
        }

        _out(_t);
    }

    subscribe(handler) {
        _observers.get(this.out).subscribe(handler);
    }
}
