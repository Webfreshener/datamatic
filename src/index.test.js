import {RxVO} from './index';
import {RxVO as RxVOPackaged} from '../dist/rxvo'
import {_data, _ns} from "../fixtures/PatternProperties.schemas";

describe("Index", () => {
    describe("Package Validation Tests", () => {
        it("should import from ES6 Source", function () {
            expect(typeof RxVO).toEqual('function');
        });

        it("should import from WebPacked Lib", function () {
            expect(typeof RxVOPackaged).toEqual('function');
        });

        it("should import from ES5 `require`", () => {
            expect(typeof (require('../index').RxVO)).toEqual('function');
        });
    });

    describe("Polyfill", () => {
        // this test is strictly for the sake of jest coverage
        // todo: put browser testing on this, node has Object.assign
        // todo: review browser support requirements
        it("tests the polyfill for Object.assign", () => {
            expect(Object.assign).toBeDefined();
        })
    });

    // describe.skip("Pattern Prop", () => {
    //     it("should test", (done) => {
    //         const _rxvo = new RxVO(_ns);
    //         _rxvo.subscribe({
    //             next: (data) => {
    //                 // console.log(`data ${data}`);
    //                 done()
    //             },
    //             error: (e) => {
    //                 done(`error message: ${e}`);
    //             }
    //         });
    //         _rxvo.model = _data;
    //         // console.log(_rxvo.errors);
    //     });
    // });
});
