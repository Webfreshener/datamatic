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
 * Pipeline Class
 */
export class Pipeline {
    static getExecs(..._pvs) {
        return _pvs.map((_p) => {
            _p = Array.isArray(_p) ? _p[0] : _p;
            return (d) => {
                const _exec = ((typeof _p === "function") ? _p : void 0) ||
                    // is pipeline or implements pipeline api
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
        _cache.set(this, []);

        // TODO: solve this issue with async methods to remove kludge
        if (pipesOrVOsOrSchemas[0] instanceof Function) {
            pipesOrVOsOrSchemas.splice(0, 0, DefaultVOSchema);
        }

        pipesOrVOsOrSchemas = mapArgs(...pipesOrVOsOrSchemas);

        // stores config & state
        _pipes.set(this,
            Properties.init(this, {
                callbacks: fill(Pipeline.getExecs(...pipesOrVOsOrSchemas)),
                pipesOrVOsOrSchemas: pipesOrVOsOrSchemas,
                pipes: _pipes,
            })
        );

        // define exec in constructor to ensure method visibility
        Object.defineProperty(this, "exec", {
            // value: (data) => pipes.get(this).exec(data),
            value: (data) => {
                return _pipes.get(this).exec(data);
            },
            enumerable: true,
            configurable: false,
        });
    }

    /**
     * Creates new `pipeline` segment
     * @param pipesOrSchemas
     * @returns {Pipeline}
     */
    pipe(...pipesOrSchemas) {
        return new Pipeline([
            _pipes.get(this).out, ...pipesOrSchemas
        ]);
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
     * links pipeline segment to direct output to target pipeline
     * @param target
     * @param callbacks function[]
     * @returns {Pipeline}
     */
    link(target, ...callbacks) {
        if (!(target instanceof Pipeline)) {
            throw `item for "target" was not a Pipe`;
        }

        // allow for array literal in place of inline assignment
        if (Array.isArray(callbacks[0])) {
            callbacks = callbacks[0];
        }

        callbacks = fill(callbacks || []);

        // creates observer and stores it to links map for `pipeline`
        const _sub = this.subscribe({
            next: (data) => {
                const _res = Executor.exec(callbacks, data.toJSON ? data.toJSON() : data);
                if (_res instanceof Promise) {
                    return _res.then((_) => target.write(_));
                }

                target.write(_res);
            },
            error: (e) => {
                console.error(e);
            },
            // handles unlink & cleanup on complete
            complete: () => this.unlink(target)
        });

        _pipes.get(this).links.set(target, _sub);
        return this;
    }

    /**
     * Unlink `pipeline` segment from target `pipeline`
     * @param target
     * @returns {Pipeline}
     */
    unlink(target) {
        if (!(target instanceof Pipeline)) {
            throw `item for "target" was not a Pipe`;
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
    get errors() {
        return _pipes.get(this).vo.errors;
    }

    /**
     * Returns JSON-SCHEMA for `pipeline` output
     * @returns {object}
     */
    get schemas() {
        return [..._pipes.get(this).schemas];
    }

    /**
     * Creates array of new `pipeline` segments that run in parallel
     * @param schemasOrPipes
     * @returns {*}
     */
    split(schemasOrPipes) {
        return schemasOrPipes.map((_) => this.pipe(_));
    }

    /**
     * Iterates pipeline callbacks via generator function
     * @param data
     * @returns {generator}
     */
    yield(data) {
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
     * @returns {Pipeline}
     */
    merge(pipeOrPipes, pipeOrSchema = {schemas: [DefaultVOSchema]}) {
        const _out = new Pipeline(pipeOrSchema);
        _pipes.get(this).listeners = [
            ..._pipes.get(this).listeners,
            // -- feeds output of map to listeners array
            ...(Array.isArray(pipeOrPipes) ? pipeOrPipes : [pipeOrPipes])
                .filter((_p) => ((typeof _p.subscribe) === "function"))
                .map((_p) => {
                    _p.subscribe((d) => {
                        // -- all pipes now write to output tx
                        _out.write(d.toJSON ? d.toJSON() : d);
                    });
                    return _p;
                })
        ];
        // -- returns output tx for observation
        return _out;
    }

    /**
     * Writes data to pipeline segment
     * @param data
     * @returns {Pipeline}
     */
    write(data) {
        _pipes.get(this).vo.model = data;
        return this;
    }

    /**
     * Creates clone of current `pipeline` segment
     * @returns {Pipeline}
     */
    clone() {
        const $ref = _pipes.get(this);
        const _cz = class extends Pipeline {
            constructor() {
                super();
                _pipes.set(this, $ref);
                _pipes.get(this).listeners = [...$ref.listeners];
            }
        };
        return new _cz();
    }

    /**
     * Terminates input on `pipeline` segment. This is irrevocable
     * @returns {Pipeline}
     */
    close() {
        _pipes.get(this).out.freeze();
        return this;
    }

    /**
     * Returns write status of `pipeline`
     * @returns {boolean}
     */
    get writable() {
        return !_pipes.get(this).out.isFrozen;
    }

    /**
     * Informs `pipeline` to rate limit notifications based on time interval
     * @param rate
     * @returns {Pipeline}
     */
    throttle(rate) {
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
     * Returns product of Nth occurrence of `pipeline` execution
     * @param nth
     * @returns {Pipeline}
     */
    sample(nth) {
        _pipes.get(this).ivl = nth;
        return this;
    }

    /**
     * Subscribes to `pipeline` output notifications
     * @param handler
     * @returns {Observable}
     */
    subscribe(handler) {
        if (!(typeof handler).match(/^(function|object)$/)) {
            throw "handler required for Pipeline::subscribe";
        }

        return _pipes.get(this).out.subscribe(handler);
    }

    /**
     * Provides current state of `pipeline` output. alias for toJSON
     * @returns {Object|Array}
     */
    tap() {
        return this.toJSON();
    }

    /**
     * Convenience Method for Promise based flows.
     * Writes data to `pipeline` and wraps observer in Promise
     *
     * @param data
     * @returns {Promise<Pipeline>}
     */
    async promise(data) {
        return await new Promise((resolve, reject) => {
            this.subscribe({
                next: (d) => {
                    resolve(d);
                },
                error: (e) => {
                    reject(e);
                }
            });
            this.write(data);
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
     * Provides current state of `pipeline` output.
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
    constructor(target, vo) {
        const _self = this;

        Object.defineProperties(this, {
            vo: {
                get: () => vo,
                enumerable: true,
                configurable: false,
                // writable: false,
            }
        })

        _pipes.set(this, target);
        this.vo.subscribe({
            next: (d) => _self.next(d),
            error: (e) => _self.error(e),
            complete: () => _self.complete(),
        });
    }

    /**
     *
     * @returns {Pipeline}
     */
    get target() {
        return _pipes.get(this);
    }

    // /**
    //  *
    //  * @returns {Validator}
    //  */
    // get vo() {
    //     console.log(`vo _pipes.get(this): ${_pipes.get(this)}`);
    //     return {};//_pipes.get(_pipes.get(this)).vo;
    // }

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
     * closes `pipeline` on complete notification
     */
    complete() {
        this.target.close();
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
        if ((_t instanceof Promise) || ((_type === "function") || (_type === "object")) && _target.writable) {
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
