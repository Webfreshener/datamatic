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
import {BehaviorSubject} from "rxjs/Rx";

const _observers = new WeakMap();

export class VxBehaviorSubject {
    /**
     * @constructor
     */
    constructor() {
        _observers.set(this, {
            onNext: new BehaviorSubject(null).skip(1),
            onError: new BehaviorSubject(null).skip(1),
            onComplete: new BehaviorSubject(null).skip(1),
        });
    }

    /**
     * Creates BehaviorSubjects
     * @returns {VxBehaviorSubject}
     */
    static create() {
        return new VxBehaviorSubject();
    }

    /**
     * Calls next on Next Subject
     */
    next(value) {
        const _o = _observers.get(this);
        if (_o !== null) {
            _o.onNext.next(value);
        }
    }

    /**
     * Calls next on Error Subject
     * @param error
     */
    error(error) {
        const _o = _observers.get(this);
        if (_o !== null) {
            _o.onError.next(error);
        }
    }

    /**
     * Calls next on Complete Subject
     */
    complete() {
        const _o = _observers.get(this);
        if (_o !== null) {
            _o.onComplete.next();
            // calls complete on all Subjects
            Object.keys(_o).forEach(_ => _o[_].complete());
        }
    }

    /**
     * Subscribes handler method to property observer
     * @param handler
     * @returns {object|boolean}
     */
    subscribe(handler) {
        const _o = _observers.get(this);
        // references to subscriptions for Observable
        const _subRefs = [];

        // creates an extensible object to hold our unsubscribe method
        // and adds unsubscribe calls to the Proto object
        const _subs = class { };

        if ((typeof handler) === "function") {
            // if is raw function, we pass straight in as `next`
            _subRefs.push(_o.onNext.subscribe(handler));
        } else {
            // inits observer handlers if defined on passed `func` object
            [
                {call: "onNext", func: "next"},
                {call: "onError", func: "error"},
                {call: "onComplete", func: "complete"},
            ].forEach((obs) => {
                // use of braces is due to unreliability of `hasOwnProperty`
                if (handler[obs.func]) {
                    // if the notification type handler is present, subscribe to it
                    _subRefs.push(_o[obs.call].subscribe(handler[obs.func]));
                }
            });
        }

        // adds unsubscribe to the Proto object
        _subs.prototype.unsubscribe = () => {
            _subRefs.forEach((sub) => sub.unsubscribe());
        };

        return new _subs();
    }
}
