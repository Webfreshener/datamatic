import {_exists, _observers} from "./_references";
import {Set} from "./set";
import {Schema} from "./schema";
import {BehaviorSubject} from "rxjs/Rx";

export class ObserverBuilder {
    /**
     * @constructor
     */
    constructor() {
        _observers.set(this, {});
    }

    /**
     * @returns list of validation paths
     */
    list() {
        let _v = _observers.get(this);
        return object.keys(_v);
    }

    /**
     * @param path
     * @returns item at path reference
     */
    get(path) {
        let _o = _observers.get(this);
        return _exists(_o[path]) ? _o[path] : null;
    }

    /**
     *
     * @param forPath
     * @param oRef
     */
    create(forPath, oRef) {
        if (!(oRef instanceof Schema || oRef instanceof Set)) {
            throw "oRef must be instance of Schema or Set";
        }
        let _o = _observers.get(this);
        _o[forPath] = {
            onNext: new BehaviorSubject().skip(1),
            onError: new BehaviorSubject().skip(1),
            onComplete: new BehaviorSubject().skip(1),
        }
    }

    /**
     * calls next on Next Subject
     * @param path
     * @param value
     */
    next(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onNext.next(value);
        }
    }

    /**
     * calls next on Complete Subject
     * @param path
     * @param value
     */
    complete(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onComplete.next(value);
        }
    }

    /**
     * calls next on Error Subject
     * @param path
     * @param value
     */
    error(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.onError.next(value);
        }
    }
}
