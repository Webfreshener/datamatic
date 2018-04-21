import {_oBuilders} from "./_references";

let _jsd;
let _instance;

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

export default class Notifier {

    static getInstance() {
        return new this;
    }

    /**
     *
     * @param jsd
     * @returns {Notifier|*}
     */
    constructor(jsd) {
        if (_instance) {
            return _instance;
        }

        _instance = this;
        _jsd = jsd;
    }

    /**
     *
     * @param forPath
     * @param value
     */
    sendUpdate(forPath, value) {
        _jsd.getPath(forPath).model = value;
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

            const _models = _jsd.getModelsInPath(forPath);

            if (_models[0] !== "") {
                _models.splice(0, 0, "")
            }

            _models.forEach((model) => {
                _oBuilders.get(_jsd).next(model.$ref);
            });
        }, 0);
    }

    /**
     *
     * @param forPath
     * @param error
     */
    sendError(forPath, error) {
        const _models = _jsd.getModelsInPath(forPath);
        _models.forEach((model) => {
            _oBuilders.get(_jsd).error(model.$ref,
                new ErrorNotification(model.$ref.path, error));
        });
    }

    /**
     *
     * @param forPath
     */
    sendComplete(forPath) {
        const _models = _jsd.getModelsInPath(forPath);
        _models.forEach((model) => {
            _oBuilders.get(_jsd).complete(model.$ref);
        });
    }
}