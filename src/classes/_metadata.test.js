import {MetaData} from "./_metaData";
import {Schema} from "./schema";
import {JSD} from "./jsd";
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
describe("MetaData Units", () => {
    let _md = null;
    describe( "SubClass Validation", ()=> {
        it( "should accept objects that are subclasses of Schema", function() {
            let _ = new Schema(new JSD(basicModel));
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
        const jsd = new JSD(basicModel);
        let _ = jsd.document;
        const _md = new MetaData( new Schema(jsd), {_path: "key", _root: _, _parent: _});
        it("should access `root` property", function() {
            expect(typeof _md.root).toBe("object");
        });
        it("should access `path` property", function() {
            expect(_md.path).toEqual("key");
        });
        it("should access `parent` property", function() {
            let _md = new MetaData( _, { _path: "", _root: _});
            expect(typeof _md.parent).toEqual("object");
        });
    });
});
