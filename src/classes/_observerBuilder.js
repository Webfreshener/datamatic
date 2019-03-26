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
     * @param target {Model}
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
     * lists all registered observer paths
     * @returns {*}
     */
    list() {
        return _observerPaths.get(this).map((o) => o[0]);
    }

    /**
     * Creates BehaviorSubjects for given Model
     * @param target {Model}
     */
    create(target) {
        const _o = _observers.get(this);
        const _h = {
            onNext: new BehaviorSubject(null).skip(1),
            onError: new BehaviorSubject(null).skip(1),
            onComplete: new BehaviorSubject(null).skip(1),
        };
        _o.set(target, _h);
        _observerPaths.get(this).splice(-1, 0, [`${target.path}`, target]);
        return _o.get(target);
    }

    /**
     * mutes notifications to `target` observers
     * @param target
     */
    mute(target) {
        const _idx = _observerPaths.get(this).findIndex((el) => el[0] === `${target.path}` && el[1] === target);
        console.log(`mute _idx: ${_idx}`);
        _observerCache.set(target, {idx: _idx, value: _observerPaths.get(this).splice(_idx, 1)});
    }

    /**
     * unmutes notifications to `target` observers if muted
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
     * @param target {Model}
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
     * @param target {Model}
     */
    complete(target) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onComplete.next(target);
        }
    }

    /**
     * Calls next on Error Subject
     * @param target {Model}
     * @param message {*}
     */
    error(target, message) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onError.next(message);
        }
    }
}
