import {JSD}  from './index';
import {JSD as JSDPackaged}  from '../dist/jsd'

describe.skip("Package Validation Tests", () => {
    it("should import from ES6 Source", function () {
        expect(typeof JSD).toEqual('function');
    });

    it("should import from WebPacked Lib", function () {
        expect(typeof JSDPackaged).toEqual('function');
    });

    it("should import from ES5 `require`", () => {
        expect(typeof (require('../index'))).toEqual('function');
    });
});
