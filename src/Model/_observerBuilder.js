/* ############################################################################
The MIT License (MIT)

Copyright (c) 2016 - 2019 Van Schroeder
Copyright (c) 2017-2019 Webfreshener, LLC

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
import {_observers} from "./_references";
import {BehaviorSubject} from "rxjs/Rx";

const _observerPaths = new WeakMap();
const _observerCache = new WeakMap();

export class ObserverBuilder {
    /**
     * @constructor
     */
    constructor() {
        _observers.set(this, new WeakMap());
        _observerPaths.set(this, []);
    }

    /**
     * Retrieves BehaviorSubject Collection for given Model
     * @param target {BaseModel}
     * @returns {Observer|null} Observer at path reference
     */
    get(target) {
        return _observers.get(this).get(target) || null;
    }

    /**
     * Retrieves BehaviorSubject Collection for Model at given path
     * @param path
     * @returns {*}
     */
    getObserverForPath(path) {
        const _itm = _observerPaths.get(this).find((o) => o[0] === `${path}`);
        return _itm && _itm.length > 1 ? this.get(_itm[1]) : null;
    }

    /**
     * Lists all registered observer paths
     * @returns {*}
     */
    list() {
        return _observerPaths.get(this).map((o) => o[0]);
    }

    /**
     * Creates BehaviorSubjects for given Model
     * @param target {BaseModel}
     */
    create(target) {
        const _o = _observers.get(this);
        const _h = {
            onNext: new BehaviorSubject(null).skip(1),
            onError: new BehaviorSubject(null).skip(1),
            onComplete: new BehaviorSubject(null).skip(1),
        };
        _o.set(target, _h);
        _observerPaths.get(this).splice(0, 0, [`${target.path}`, target]);
        return _o.get(target);
    }

    /**
     * Mutes notifications to `target` observers
     * @param target
     */
    mute(target) {
        const _idx = _observerPaths.get(this).findIndex(
            (el) => el[0] === `${target.path}` && el[1] === target
        );
        _observerCache.set(target, {idx: _idx, value: _observerPaths.get(this).splice(_idx, 1)});
    }

    /**
     * Unmutes notifications to `target` observers if muted
     * @param target
     */
    unmute(target) {
        const _cached = _observerCache.get(target);

        if (_cached) {
            _observerPaths.get(this).splice(_cached.idx, 0, _cached.value);
            _observerCache.delete(target);
        }
    }

    /**
     * Calls next on Next Subject
     * @param target {BaseModel}
     */
    next(target) {
        if (!target || target.isDirty) {
            return;
        }

        let _o = !_observerCache.get(target) ? this.get(target) : null;

        if (_o !== null) {
            _o.onNext.next(target);
        }
    }

    /**
     * Calls next on Complete Subject
     * @param target {BaseModel}
     */
    complete(target) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onComplete.next();
        }
    }

    /**
     * Calls next on Error Subject
     * @param target {BaseModel}
     * @param message {*}
     */
    error(target, message) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onError.next(message);
        }
    }
}
