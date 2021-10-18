import {PropertiesModel} from "./propertiesModel";
import {Model} from "./index";
import {basicModel, scoresModel} from "../../fixtures/PropertiesModel.schemas";
import {_observers, _oBuilders} from "./_references";
import deepEqual from "deep-equal";

describe("RXJS Test Suite", () => {
    describe("Basic Notifications", () => {
        describe("update", () => {
            // let _owner;
            // beforeEach(() => {
            //     _owner = new Model(basicModel);
            // });
            //
            // afterEach(() => {
            //     _owner = null;
            // });

            it("should have some tests", (done) => {
                const _owner = new Model({schemas: [basicModel]});
                const _d = {
                    name: "A Name",
                    age: 99,
                    active: true,
                };

                const _sub = _owner.subscribe({
                    next: (model) => {
                        _sub.unsubscribe();
                        expect(deepEqual(model.toJSON(), _d)).toBe(true);
                        done()
                    },
                    error: (e) => {
                        _sub.unsubscribe();
                        done(e);
                    }
                });

                _owner.model = _d;
            });
        });
    });

    describe("Nested Element Notifications", () => {
        describe("update", () => {
            // let _owner;

            beforeEach(() => {
                // _owner = new Model(scoresModel);
            });

            afterEach(() => {
                // _owner = null;
            });

            it("should have some tests", (done) => {
                const _owner1 = new Model({schemas: [scoresModel]});
                _owner1.model = {
                    name: "A Game",
                    topScores: [{
                        name: "Player 1",
                        score: 1000000000,
                    }, {
                        name: "Player 2",
                        score: 2000000000,
                    }],
                };

                let cnt = 0;

                const _sub = _owner1.model.topScores.$model.subscribe({
                    next: (res) => {
                        expect(res.length).toBe(3);
                        _sub.unsubscribe();
                        done()
                    },
                    error: (e) => {
                        _sub.unsubscribe();
                        done(JSON.stringify(e));
                    }
                });

                _owner1.model.topScores.push({
                    name: "Player 3",
                    score: 3000000000,
                });

                // console.log(_owner1.errors);

                // _owner.model.topScores.splice(1, 1, {
                //     name: "Player 3",
                //     score: 4000000000,
                // });

            });
        });
    });
});
