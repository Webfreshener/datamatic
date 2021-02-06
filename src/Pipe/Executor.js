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
import {wrapCallback} from "./Utils";

export class Executor {
    /**
     *
     * @param callbacks
     * @param data
     * @returns {*}
     * @private
     */
    static exec(callbacks, data) {
        let _value;
        const _it = _cbIterator(callbacks);
        let _done = false;
        _value = data;
        while (!_done) {
            let {done, value} = _it.next(_value);
            if (!(_done = done)) {
                _value = value;
            }
        }

        return _value;
    };
}

/**
 * Promise-safe callback iterator for pipe transactions
 * @param callbacks
 * @returns {{next: (function(*=): *)}}
 * @private
 */
const _cbIterator = (callbacks) => {
    let _idx = -1;
    if (Array.isArray(callbacks[0])) {
        callbacks = callbacks[0];
    }

    return {
        next: (data) => {
            return (_idx++ < (callbacks.length - 1)) ? {
                value: (wrapCallback(callbacks[_idx] || ((__) => __)))(data),
                done: false,
            } : {
                value: data || false,
                done: true,
            };
        },
    };
};
