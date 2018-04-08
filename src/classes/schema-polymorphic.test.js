import {Schema} from "./schema";
import {JSD} from "./jsd";
describe("Schema Polymorphism Tests", () => {
    describe.only("Polymorphism", () => {
        const _s = require("../../fixtures/polymorphic.schema.json");
        // this.schema = new Schema(_s, null, new JSD());
        const _jsd = new JSD(_s);
        it("should initialize from polymorphic schema fixture", () => {
            expect(_jsd.document instanceof Schema).toBe(true);
        });

        it("should check for polymorphic properties", (done) => {
            let _d = {
                badParam: false
            };

            let _f = {
                next: () => {
                    done("did not fail badParam as expected");
                },
                error: (e) => {
                    expect(e).toBe("'badParam' expected value of type 'Object'. Type was '<boolean>'");
                    done();
                }
            };

            let _sub = _jsd.document.subscribe(_f);
            _jsd.document.model = _d;
        });
    });
});