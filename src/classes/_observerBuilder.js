import {_observers} from "./_references";
import {BehaviorSubject} from "rxjs/Rx";

const _observerPaths = new WeakMap();

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
     * Calls next on Next Subject
     * @param target {Model}
     */
    next(target) {
        let _o = this.get(target);
        if (_o) {
            _o.onNext.next(target);

            // if (!target.isDirty && target.parent !== null) {
            //     this.next(target.parent);
            // }
        }
    }

    /**
     * Calls next on Complete Subject
     * @param target {Model}
     */
    complete(target) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onComplete.next(target.model);
            // if (!target.isDirty && target.parent !== null) {
            //     this.complete(target.parent);
            // }
        }
    }

    /**
     * Calls next on Error Subject
     * @param path {string}
     * @param message {*}
     */
    error(target, message) {
        let _o = this.get(target);
        if (_o !== null) {
            _o.onError.next(message);
            // if (!target.isDirty && target.parent !== null) {
            //     this.error(target.parent, message);
            // }
        }
    }
}
