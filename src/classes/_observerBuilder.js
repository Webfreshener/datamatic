import {_exists, _observers} from './_references';
import {Set} from './set';
import {Schema} from './schema';
import {Subject} from 'rxjs/Rx';
let __oBuilder = null;
export class ObserverBuilder {
    /**
     * @constructor
     */
    constructor() {
        if (!_exists(__oBuilder)) {
            _observers.set((__oBuilder = this), {});
        }
        return __oBuilder;
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

    create(forPath, oRef) {
        if (!(oRef instanceof Schema || oRef instanceof Set)) {
            throw 'oRef must be instance of Schema or Set';
        }
        let _o = _observers.get(this);
        _o[forPath] = new Subject();
    }

    next(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.next(value);
        }
    }

    complete(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.complete(value);
        }
    }

    error(path, value) {
        let _o = this.get(path);
        if (_o) {
            _o.error(value);
        }
    }

    /**
     * @returns singleton ObserverBuilder reference
     */
    static getInstance() {
        return new this;
    }

    /**
     * @returns validators WeakMap
     */
    static getObservers() {
        return _observers.get( ObserverBuilder.getInstance() );
    }
    /**
     *
     */
    static create(path, oRef) {
        return ObserverBuilder.getInstance().create(path, oRef);
    }
}
