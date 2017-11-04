import {MetaData} from "./_metaData";
import {Schema} from './schema';
import {JSD} from './jsd';
describe("MetaData Units", () => {
    let _md = null;
    describe( "SubClass Validation", ()=> {
        it( "should not accept objects that are not subclasses of Schema or Set", function() {
            const _e = "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'";
            expect(() => _md = new MetaData({}, {})).toThrow(_e);
        });
        it( "should accept objects that are subclasses of Schema", function() {
            let _ = new Schema({extensible: true}, null, new JSD());
            !expect(() => _md = new MetaData(_, {_path: "", _root: _})).not.toThrow(
                "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'");
        });
        it( "should accept objects that are subclasses of Set", function() {
            let _ = new Set();
            expect(()=> _md = new MetaData( _, { _path: "", _root: _})).not.toThrow(
                "new MetaData() argument 1 requires subclass Schema or Set. Was subclass of '<Object>'"
            );
        });
    });
    describe( "Parameter Accessor Validation", ()=> {
        let _ = new Schema({}, null, new JSD());
        let _md = new MetaData( _, { _path: "key", _root: _})
        it('should access `root` property', function() {
            expect(_md.root === _).toBe(true);
        });
        it('should access `path` property', function() {
            expect(_md.path).toEqual("key");
        });
        it('should access `parent` property', function() {
            let _md = new MetaData( _, { _path: "", _root: _})
            expect(_md.parent).toEqual(_);
        });
    });
});
