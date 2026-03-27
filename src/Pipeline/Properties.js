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
import {Executor} from "./Executor";
import {Validator} from "./Validator";
import {default as DefaultVOSchema} from "../schemas/default-pipe-vo.schema";
import {PipeListener} from "./Pipeline";
import {derivePipeSchemas} from "./Utils";

const defaultPipe = {
    schema: [DefaultVOSchema, DefaultVOSchema],
    exec: (d) => d,
};

export const _defaultPipeForTests = defaultPipe;

/**
 *
 */
export class Properties {
    static init(pipe, properties) {
        const {callbacks, execBridge, pipesOrVOsOrSchemas, pipes} = properties;
        const _txP = {};
        const {
            inPipe: _inPipe,
            inSchema: _inSchema,
            outSchema: _outSchema,
            schemas: _pSchemas,
        } = derivePipeSchemas(pipesOrVOsOrSchemas);

        const _vo = (_inPipe instanceof Validator) ? _inPipe : new Validator(_inSchema);

        return Object.defineProperties(_txP, {
            callbacks: {
                value: callbacks,
                enumerable: true,
                configurable: false,
            },
            execBridge: {
                value: execBridge,
                enumerable: false,
                configurable: false,
            },
            rate: {
                value: 1,
                enumerable: true,
                configurable: true,
            },
            links: {
                value: new WeakMap(),
                enumerable: true,
                configurable: false,
            },
            exec: {
                value: (data) => {
                    try {
                        return execBridge ? execBridge.exec(data) : Executor.exec(callbacks, data);
                    } catch (e) {
                        throw {
                            error: e,
                            data: data,
                        };
                        // _observers.get(_txP.out).error({
                        //     error: e,
                        //     data: data,
                        // });
                    }
                },
                enumerable: false,
                configurable: false,
            },
            out: {
                /**
                 * validates output
                 */
                value: (() => {
                    const _txV = new Validator(_outSchema);
                    // unsubscribe all observers on complete notification (freeze/close)
                    _txV.subscribe({
                        complete: () => {
                            (pipes.get(pipe).listeners || []).forEach((_) => {
                                if (_.unsubscribe) {
                                    _.unsubscribe();
                                }
                            });
                            pipes.get(pipe).listeners = [];
                        },
                    });
                    return _txV;
                })(),
                enumerable: true,
                configurable: false,
            },
            schema: {
                value: [_inSchema, _outSchema],
                enumerable: true,
                configurable: false,
            },
            schemas: {
                // enforces 2 schema minimum (in/out)
                value: _pSchemas.length < 2 ? [..._pSchemas, ..._pSchemas] : _pSchemas,
                enumerable: true,
                configurable: false,
            },
            vo: {
                value: _vo,
                enumerable: true,
                configurable: false,
                writable: false,
            },
            pOS: {
                value: pipesOrVOsOrSchemas,
                enumerable: false,
                configurable: false,
            },
            listeners: {
                value: [new PipeListener(pipe, _vo)],
                enumerable: true,
                configurable: false,
                writable: true,
            },
            ivl: {
                value: 0,
                enumerable: true,
                configurable: false,
                writable: true,
            },
            ivlVal: {
                value: 0,
                enumerable: true,
                configurable: false,
                writable: true,
            },
        });
    }
}
