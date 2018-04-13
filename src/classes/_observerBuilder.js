import {_exists, _observers} from "./_references";
import {BehaviorSubject} from "rxjs/Rx";

export class ObserverBuilder {
    /**
     * @constructor
     */
    constructor() {
        _observers.set(this, {});
    }

    /**
     * @returns {string[]} of validation paths
     */
    list() {
        let _v = _observers.get(this);
        return Object.keys(_v);
    }

    /**
     * @param path {string}
     * @returns {Observer} Observer at path reference
     */
    get(path) {
        let _o = _observers.get(this);
        return _exists(_o[path]) ? _o[path] : null;
    }

    /**
     *
     * @param forPath {string}
     * @param oRef {Model|Schema|Set}
     */
    create(forPath, oRef) {
        let _o = _observers.get(this);
        _o[forPath] = {
            onNext: new BehaviorSubject(null).skip(1),
            onError: new BehaviorSubject(null).skip(1),
            onComplete: new BehaviorSubject(null).skip(1),
        }
    }

    /**
     * calls next on Next Subject
     * @param path {string}
     * @param value {*}
     */
    next(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onNext.next(value);
        }
    }

    /**
     * calls next on Complete Subject
     * @param path {string}
     * @param value {*}
     */
    complete(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onComplete.next(value);
        }
    }

    /**
     * calls next on Error Subject
     * @param path {string}
     * @param value {*}
     */
    error(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onError.next(value);
        }
    }
}
