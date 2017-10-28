import {MetaData} from "./_metaData";
import {Schema} from './schema';
describe("MetaData Units", () => {
    let _md = null;
    describe( "SubClass Validation", ()=> {
        it( "should not accept objects that are not subclasses of Schema or Set", function() {
            expect(()=> _md = new MetaData({}, {})).to.throw(
                "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'");
        });
        it( "should accept objects that are subclasses of Schema", function() {
            let _ = new Schema({extensible: true});
            expect(()=> _md = new MetaData( _, { _path: "", _root: _})).to.not.throw(
                "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'");
        });
        it( "should accept objects that are subclasses of Set", function() {
            let _ = new Set();
            expect(()=> _md = new MetaData( _, { _path: "", _root: _})).to.not.throw(
                "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'");
        });
    });
    describe( "Parameter Accessor Validation", ()=> {
        let _ = new Schema({});
        let _md = new MetaData( _, { _path: "key", _root: _})
        it('should access `root` property', function() {
            (_md.root === _).should.be.true;
        });
        it('should access `path` property', function() {
            _md.path.should.eq("key");
        });
        it('should access `parent` property', function() {
            let _md = new MetaData( _, { _path: "", _root: _})
            _md.parent.should.eq(_);
        });
    });
});
