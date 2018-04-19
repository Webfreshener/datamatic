import {PropertiesModel} from "./propertiesModel";
import {JSD} from "./jsd";
import {basicModel, scoresModel} from "../../fixtures/PropertiesModel.schemas";
import {_observers, _oBuilders} from "./_references";
import {getRoot} from "./utils";

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
                _jsd = new JSD(scoresModel);
            });

            it.only("should have some tests", (done) => {

                _jsd.model = {
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

                // _jsd.subscribeTo("/properties/topScores", {
                _jsd.subscribe({
                    next: (res) => {
                        console.log(`${JSON.stringify(getRoot(res))}`);
                        // console.log(`${_jsd.}`);
                        // if (cnt < 1) {
                        //     console.log("\n\n 1st iteration \n\n");
                        //     cnt++;
                        //     return;
                        // }

                        expect(res.model.topScores.length).toBe(3);
                        done()
                    },
                    error: (e) => {
                        done(e);
                    }
                });

                console.log(_jsd.model);
                // _jsd.model.topScores.push({
                //     name: "Player 3",
                //     score: 3000000000,
                // });

                _jsd.model.topScores = [{
                    name: "Player 1",
                    score: 1000000000,
                }, {
                    name: "Player 2",
                    score: 2000000000,
                }, {
                    name: "Player 3",
                    score: 3000000000,
                }];

                // console.log(`${_jsd.model.$ref}`);

                // _jsd.model = {
                //     name: "A Game",
                //     topScores: [{
                //         name: "Player 1",
                //         score: 1000000000,
                //     }, {
                //         name: "Player 2",
                //         score: 2000000000,
                //     }, {
                //         name: "Player 3",
                //         score: 3000000000,
                //     }],
                // };
            });
        });
    });
});