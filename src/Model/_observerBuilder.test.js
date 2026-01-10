import {ObserverBuilder} from "./_observerBuilder";
import {Model} from "./index";
import {PropertiesModel} from "./propertiesModel";

describe("ObserverBuilder Unit Test Suite", () => {
    describe("Builder Methods", () => {
        let _observer = null;
        let _observerForModel = null;
        let _model = null;
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

            const _root = new Model({
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

            _model = new PropertiesModel(_root, "root#")

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

        it.skip("should subscribe to observer and get value", function (done) {
            const _data = {
                name: "item-A",
                active: true
            };

            const _f = {
                next: (o) => {
                    expect(`${o}`).toBe(JSON.stringify(_data));
                    done();
                },
                error: (e) => {
                    done(e);
                }
            };
            _model.subscribe(_f);
            _model.model = _data;
        });
    });
});
