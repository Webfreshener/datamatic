import {RxVO} from "./rxvo";
import {Pipe} from "./pipe";
import each from 'jest-each';
import {basicCollection} from "../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../fixtures/pipes-test.data";

describe("Pipes tests", () => {
    const _rxvo = new RxVO({schemas: [basicCollection]});
    _rxvo.subscribe({
        error: (e) => {
            throw JSON.stringify(e);
        }
    });
    const _pipe = new Pipe(_rxvo, (d) => {
        return d.model.filter((itm) => itm.active);
    }, basicCollection);
    describe("creation", () => {
        each([_pipe.close, _pipe.fork, _pipe.link, _pipe.pipe, _pipe.once, _pipe.split, _pipe.write])
            .test("should create a pipe", (func) => {
                expect(func).toBeTruthy();
            });
    });

    describe("pipe", () => {
        it("should transform data with callback", (done) => {
            _pipe.once().subscribe({
                next: (d) => {
                    console.log(`${d}`);
                    done();
                },
                error: (e) => {
                    done(e);
                }
            });
            _rxvo.model = data;
        })

    });

});
