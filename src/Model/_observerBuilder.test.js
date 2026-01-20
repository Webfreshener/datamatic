import {ObserverBuilder} from "./_observerBuilder";
import {Model} from "./index";
import {PropertiesModel} from "./propertiesModel";

describe("ObserverBuilder Unit Test Suite", () => {
    describe("Builder Methods", () => {
        let _observer = null;
        let _observerForModel = null;
        let _model = null;
        let _root = null;
        const _schema = {
            $id: "root#",
            type: "object",
            properties: {
                name: {
                    type: "string",
                },
                active: {
                    type: ["boolean", "number"],
                }
            },
        }

        beforeEach(function () {
            _observer = new ObserverBuilder();
            // try {
            //     _model = new Model({schemas: [_schema]});
            // } catch (e) {
            //     console.error(e);
            // }

            _root = new Model({
                schemas: [_schema],
                //     [{
                //     $id: "root#",
                //     type: "object",
                //     properties: {
                //         testing: {
                //             type: "object",
                //             properties: _schema.properties,
                //         },
                //     },
                // }]
            });

            _model = _root.model.$model;

            _observerForModel = _observer.create(_model);
        });

        it("should create an observer", function () {
            expect(Object.keys(_observer.getObserverForModel(_model)))
                .toEqual(['path', 'jsonPath', 'targetId', 'onNext', 'onError', 'onComplete']);
        });

        it("returns existing observer when path is cached", () => {
            const originalGetObserverForPath = _observer.getObserverForPath;
            _observer.getObserverForPath = () => ({path: _model.path});
            expect(_observer.create(_model)).toBe(_observerForModel);
            _observer.getObserverForPath = originalGetObserverForPath;
        });

        it("returns cached model observer when path is missing", () => {
            const originalGetObserverForPath = _observer.getObserverForPath;
            const other = new PropertiesModel(new Model({schemas: [_schema]}), "other#");
            _observer.getObserverForPath = () => ({path: other.path});
            expect(_observer.create(other)).toBeUndefined();
            _observer.getObserverForPath = originalGetObserverForPath;
        });

        it("returns null for unknown model and skips notifications", () => {
            const other = new PropertiesModel(new Model({schemas: [_schema]}), "other#");
            expect(_observer.getObserverForModel(other)).toBeNull();
            _observer.next({isDirty: true});
            _observer.next(other);
            _observer.complete(other);
            _observer.error(other, "bad");
        });

        it("should subscribe to observer and get value", async () => {
            const _data = {
                name: "item-A",
                active: true
            };

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("observer did not emit in time"));
                }, 500);

                const observer = _observer.getObserverForModel(_model);
                observer.onNext.subscribe({
                    next: (o) => {
                        try {
                            expect(`${o}`).toBe(JSON.stringify(_data));
                            clearTimeout(timeout);
                            resolve();
                        } catch (e) {
                            clearTimeout(timeout);
                            reject(e);
                        }
                    },
                    error: (e) => {
                        clearTimeout(timeout);
                        reject(e);
                    }
                });

                _root.model = _data;
                _observer.next(_model);
            });
        });
    });
});
