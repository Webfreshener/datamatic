import {Schema} from "./schema";
import {JSD} from "./jsd";
import {default as polymorphicSchema} from "../../fixtures/polymorphic.schema";
import {_vBuilders} from "./_references";
describe("Schema Polymorphism Tests", () => {
    describe.skip("Polymorphism", () => {
        const _jsd = new JSD(polymorphicSchema);
        const _vBuilder = _vBuilders.get(_jsd);
        console.log(_vBuilder.list());
        it("should initialize from polymorphic schema fixture", () => {
            expect(_jsd.document instanceof Schema).toBe(true);
        });

        it("should check for polymorphic properties", (done) => {
            let _d = {
                badParam: false
            };

            let _f = {
                next: (val) => {
                    console.log(`val: ${val}`);
                    done("did not fail badParam as expected");
                },
                error: (e) => {
                    expect(e).toBe("'*.polymorphic.0' expected string, type was '<boolean>'");
                    done();
                }
            };

            let _sub = _jsd.document.subscribe(_f);
            _jsd.document.model = _d;
        });
    });
});