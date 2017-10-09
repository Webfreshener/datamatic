import { should, expect } from 'chai';
import { JSD }  from '../lib/jsd';
should();

describe('Compiled Lib Test Suite', function() {
    it("should import as method", function() {
        (typeof JSD).should.eq('function');
    });
    it("should provide expected classes", function() {
        let jsd = JSD();
        (typeof jsd.Schema).should.eq('function');
        (typeof jsd.Set).should.eq('function');
    });
});