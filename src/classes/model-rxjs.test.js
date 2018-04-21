import {PropertiesModel} from "./propertiesModel";
import {RxVO} from "./rxvo";
import {basicModel, scoresModel} from "../../fixtures/PropertiesModel.schemas";
import {_observers, _oBuilders} from "./_references";
import {getRoot} from "./utils";
import deepEqual from "deep-equal";

describe("RXJS Test Suite", () => {
    describe("Basic Notifications", () => {
        describe("update", () => {
            // let _rxvo;
            // beforeEach(() => {
            //     _rxvo = new RxVO(basicModel);
            // });
            //
            // afterEach(() => {
            //     _rxvo = null;
            // });

            it("should have some tests", (done) => {
                const _rxvo = new RxVO(basicModel);
                const _d = {
                    name: "A Name",
                    age: 99,
                    active: true,
                };

                const _sub = _rxvo.subscribe({
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

                _rxvo.model = _d;
            });
        });
    });

    describe("Nested Element Notifications", () => {
        describe("update", () => {
            // let _rxvo;

            beforeEach(() => {
                // _rxvo = new RxVO(scoresModel);
            });

            afterEach(() => {
                // _rxvo = null;
            });

            it("should have some tests", (done) => {
                const _rxvo1 = new RxVO(scoresModel);
                _rxvo1.model = {
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

                const _sub = _rxvo1.subscribe({
                    next: (res) => {
                        // expect(res.model.topScores.length).toBe(3);
                        // _sub.unsubscribe();
                        done()
                    },
                    error: (e) => {
                        // _sub.unsubscribe();
                        done(JSON.stringify(e));
                    }
                });

                _rxvo1.model.topScores.push({
                    name: "Player 3",
                    score: 3000000000,
                });

                // _rxvo.model.topScores.splice(1, 1, {
                //     name: "Player 3",
                //     score: 4000000000,
                // });

            });
        });
    });
});