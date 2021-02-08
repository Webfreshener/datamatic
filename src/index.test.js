import {Model} from './index';
import {Model as DistModel} from '../index'

describe("Index Tests", () => {
    describe("Package Validation Tests", () => {
        it("should import from ES6 Source", function () {
            expect(typeof Model).toEqual('function');
        });

        it("should import from WebPacked Lib", function () {
            expect(typeof DistModel).toEqual('function');
        });

        it("should import from ES5 `require`", () => {
            expect(typeof (require('../index').Model)).toEqual('function');
        });
    });

    describe("Polyfill", () => {
        // this test is strictly for the sake of jest coverage
        // todo: put browser testing on this, node has Object.assign
        // todo: review browser support requirements
        it("tests the polyfill for Object.assign", () => {
            expect(Object.hasOwnProperty("assign")).toBe(true);
            expect(typeof Object.assign).toEqual("function");
        })
    });

});
