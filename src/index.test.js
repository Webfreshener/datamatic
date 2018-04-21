import {RxVO}  from './index';
import {RxVO as RxVOPackaged}  from '../dist/rxvo'

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
