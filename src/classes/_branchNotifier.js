import {_oBuilders} from "./_references";
const notifiers = new WeakMap();

/**
 * protocol for Errors
 */
class ErrorNotification {
    /**
     * @constructor
     * @param {string} path
     * @param {string|string[]} error
     */
    constructor(path, error) {
        // defines getter for `path` prop
        Object.defineProperty(this, "path", {
            get: () => path,
            enumerable: true,
        });
        // defines getter for `error` prop
        Object.defineProperty(this, "error", {
            get: () => error,
            enumerable: true,
        });
    }

    toString() {
        return `"${this.path}": ${JSON.stringify(this.error)}`;
    }
}

/**
 * todo: implement this somewhere
 */
class CompleteNotification {
    /**
     * @constructor
     * @param {string} path
     */
    constructor(path) {
        Object.defineProperty(this, "path", {
            get: () => path,
            enumerable: true,
        });
    }
}

/**
 * Notification Management
 * acts as liason between Models and RxJS Subscription Dispatchers
 */
class Notifier {
    /**
     *
     * @param rxvo
     * @returns {Notifier|*}
     */
    constructor(rxvo) {
        Object.defineProperty(this, "$rxvo", {
            get: () => rxvo,
        });

        notifiers.set(rxvo, this);
    }

    /**
     * Delegates sending RxJS `next` notifications
     * @param forPath
     */
    sendNext(forPath) {
        if (forPath[0] !== ".") {
            forPath = `.${forPath}`;
        }

        this.$rxvo.getModelsInPath(forPath)
            .forEach((m) => _oBuilders.get(this.$rxvo).next(m.$model));
    }

    /**
     * Delegates sending RxJS `error` notifications
     * @param forPath
     * @param error
     */
    sendError(forPath, error) {
        this.$rxvo.getModelsInPath(forPath)
            .forEach((model) => _oBuilders.get(this.$rxvo).error(model.$model,
                new ErrorNotification(model.$model.path, error)));
    }

    /**
     * Delegates sending RxJS `complete` notifications
     * @param forPath
     */
    sendComplete(forPath) {
        this.$rxvo.getModelsInPath(forPath)
            .forEach((model) => _oBuilders.get(this.$rxvo).complete(model.$model));
    }
}

/**
 * Creates and Retrives Notification Handlers
 * @static
 */
export default class Notifiers {
    /**
     *
     * @param rxvo
     * @returns {*}
     */
    static create(rxvo) {
       new Notifier(rxvo);
       return Notifiers.get(rxvo);
    }

    /**
     *
     * @param rxvo
     * @returns {Notifier}
     */
    static get(rxvo) {
        return notifiers.get(rxvo);
    }
}
