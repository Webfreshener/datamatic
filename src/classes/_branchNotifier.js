import {_oBuilders} from "./_references";

const notifiers = new WeakMap();

class ErrorNotification {
    constructor(path, error) {
        Object.defineProperty(this, "path", {
            get: () => path,
            enumerable: true,
        });

        Object.defineProperty(this, "error", {
            get: () => error,
            enumerable: true,
        });
    }
}

class CompleteNotification {
    constructor(path) {
        Object.defineProperty(this, "path", {
            get: () => path,
            enumerable: true,
        });

    }
}

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
     *
     * @param forPath
     * @param value
     */
    sendUpdate(forPath, value) {
        this.$rxvo.getPath(forPath).model = value;
    }

    /**
     *
     * @param forPath
     */
    sendNext(forPath) {
        // this is a kludge to "wait a tic" before sending the notifications
        setTimeout(() => {
            if (forPath[0] !== ".") {
                forPath = `.${forPath}`;
            }

            const _models = this.$rxvo.getModelsInPath(forPath);

            if (_models[0] !== "") {
                _models.splice(0, 0, "")
            }

            _models.forEach((model) => {
                _oBuilders.get(this.$rxvo).next(model.$ref);
            });
        }, 0);
    }

    /**
     *
     * @param forPath
     * @param error
     */
    sendError(forPath, error) {
        const _models = this.$rxvo.getModelsInPath(forPath);
        _models.forEach((model) => {
            _oBuilders.get(this.$rxvo).error(model.$ref,
                new ErrorNotification(model.$ref.path, error));
        });
    }

    /**
     *
     * @param forPath
     */
    sendComplete(forPath) {
        const _models = this.$rxvo.getModelsInPath(forPath);
        _models.forEach((model) => {
            _oBuilders.get(this.$rxvo).complete(model.$ref);
        });
    }
}

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
