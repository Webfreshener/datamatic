import {PropertiesModel} from "./propertiesModel";
import {JSD} from "./jsd";
import {basicModel, scoresModel} from "../../fixtures/PropertiesModel.schemas";
import {_observers, _oBuilders} from "./_references";

describe("RXJS Test Suite", () => {
    describe("Basic Notifications", () => {
        describe("update", () => {
            let _jsd
            beforeEach(() => {
                _jsd = new JSD(basicModel);
            });

            it("should have some tests", (done) => {
                _jsd.subscribe({
                    next: (model) => {
                        done()
                    },
                    error: (e) => {
                        done(e);
                    }
                });

                _jsd.model = {
                    name: "A Name",
                    age: 99,
                    active: true,
                }
            });
        });
    });

    describe.only("Nested Element Notifications", () => {
        describe("update", () => {
            let _jsd;

            beforeEach(() => {
                _jsd = new JSD(scoresModel.properties.topScores);
            });

            it.only("should have some tests", (done) => {

                // _jsd.model = {
                //     name: "A Game",
                //     topScores: [{
                //         name: "Player 1",
                //         score: 1000000000,
                //     }, {
                //         name: "Player 2",
                //         score: 2000000000,
                //     }],
                // };


                const _jsd2 = new JSD(scoresModel.properties.topScores);

                _jsd2.model = [{
                    name: "Player 1",
                    score: 1000000000,
                }, {
                    name: "Player 2",
                    score: 2000000000,
                }];

                _jsd2.subscribe({
                    next: (res) => {
                        // expect(res.model.length).toBe(3);
                        done()
                    },
                    error: (e) => {
                        done(e);
                    }
                });

                // _jsd.model.topScores.push({
                //     name: "Player 3",
                //     score: 3000000000,
                // });

                _jsd2.model[0].score = "fooo";
                console.log(`_jsd2.model[0]: ${_jsd2.model.$ref}`);
            });
        });
    });
});