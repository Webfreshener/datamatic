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
import {default as DefaultVOSchema} from "../schemas/default-pipe-vo.schema";
import {Properties} from "./Properties";
import {createLegacyExecPipelineV2} from "./v2/exec";
import {cloneLegacyPipeline} from "./v2/clone";
import {
    linkLegacyPipeline,
    mergeLegacyPipelines,
    pipeLegacyPipeline,
    splitLegacyPipeline,
    unlinkLegacyPipeline,
} from "./v2/orchestration";
import {promiseLegacyPipelineObserve} from "./v2/promise";
import {
    sampleLegacyPipeline,
    throttleLegacyPipeline,
    unthrottleLegacyPipeline,
} from "./v2/rate";
import {execLegacyPipelineWrite} from "./v2/write";
import {yieldLegacyPipeline} from "./v2/yield";

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
                execBridge: createLegacyExecPipelineV2(...pipesOrVOsOrSchemas),
                pipesOrVOsOrSchemas: pipesOrVOsOrSchemas,
                pipes: _pipes,
            })
        );

        // define exec in constructor to ensure method visibility
        Object.defineProperty(this, "exec", {
            value: (data) => {
                return _pipes.get(this).execBridge.exec(data);
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
        return pipeLegacyPipeline({
            source: this,
            PipelineClass: Pipeline,
            pipesOrSchemas,
        });
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
        return linkLegacyPipeline({
            source: this,
            target,
            callbacks,
            PipelineClass: Pipeline,
            links: _pipes.get(this).links,
        });
    }

    /**
     * Unlink `pipeline` segment from target `pipeline`
     * @param target
     * @returns {Pipeline}
     */
    unlink(target) {
        unlinkLegacyPipeline({
            target,
            PipelineClass: Pipeline,
            links: _pipes.get(this).links,
        });
        return this;
    }

    /**
     * Returns validation errors
     * @returns {*|null}
     */
    get errors() {
        return _pipes.get(this).vo.errors || null;
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
        return splitLegacyPipeline({
            source: this,
            schemasOrPipes,
            PipelineClass: Pipeline,
        });
    }

    /**
     * Iterates pipeline callbacks via generator function
     * @param data
     * @returns {generator}
     */
    yield(data) {
        return yieldLegacyPipeline({
            scope: this,
            pipesOrSchemas: _pipes.get(this).pOS,
            input: data,
            emitError: (error) => this.error(error),
        });
    }

    /**
     * Merges multiple pipes into single output
     * @param pipeOrPipes
     * @param pipeOrSchema
     * @returns {Pipeline}
     */
    merge(pipeOrPipes, pipeOrSchema = {schemas: [DefaultVOSchema]}) {
        const merged = mergeLegacyPipelines({
            listeners: _pipes.get(this).listeners,
            pipeOrPipes,
            pipeOrSchema,
            PipelineClass: Pipeline,
        });

        _pipes.get(this).listeners = merged.listeners;
        return merged.output;
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
        return cloneLegacyPipeline({
            source: this,
            PipelineClass: Pipeline,
            pipes: _pipes,
        });
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
     * Informs `Pipeline` to rate limit notifications based on time interval
     * @param rate
     * @returns {Pipeline}
     */
    throttle(rate) {
        return throttleLegacyPipeline({
            pipe: this,
            rate,
            props: _pipes.get(this),
            cache: _cache.get(this),
            out: _pipes.get(this).out,
            unthrottle: (discardCacheQueue) => this.unthrottle(discardCacheQueue),
        });
    }

    /**
     * Removes rate limiting from `Pipeline` and optionally deletes unprocessed cache items
     * @param discardCacheQueue
     */
    unthrottle(discardCacheQueue=false) {
        unthrottleLegacyPipeline({
            props: _pipes.get(this),
            cache: _cache.get(this),
            out: _pipes.get(this).out,
            discardCacheQueue,
        });
    }

    /**
     * Returns product of Nth occurrence of `pipeline` execution
     * @param nth
     * @returns {Pipeline}
     */
    sample(nth) {
        return sampleLegacyPipeline({
            pipe: this,
            props: _pipes.get(this),
            nth,
        });
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
     * Provides current state of `pipeline` output. alias for `toJSON`
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
        return await promiseLegacyPipelineObserve(this, data);
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

    /**
     *
     * @returns {Validator}
     */
    get vo() {
        return _pipes.get(_pipes.get(this)).vo;
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
        const _targetProps = _pipes.get(this.target);
        // tests for presence of rate-limit timeout
        if (_targetProps.tO) {
            const __ = () => {
                return _pipes.get(this.target).exec(data);
            };
            // caches operation for later execution. Exec ordering is FIFO
            _cache.get(this.target).splice(_cache.get(this.target).length, 0, __);
            // cancels current execution
            return void 0;
        }

        const _target = _pipes.get(this);

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

        return execLegacyPipelineWrite({
            exec: (value) => _pipes.get(this).exec(value),
            data,
            out: this.out,
            writable: _target.writable,
            emitError: (error) => _observers.get(this.out).error(error),
        });
    }

    subscribe(handler) {
        _observers.get(this.out).subscribe(handler);
    }
}
