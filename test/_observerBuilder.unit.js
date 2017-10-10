import { should, expect } from "chai";
import {Schema, ObserverBuilder} from "./src/_observerBuilder.js";
should();

describe( "ObserverBuilder Unit Test Suite", ()=> {
    describe("Builder Methods", () => {
        let _observer = null;
        let _schema = null;
        before(function() {
            _observer = null;
            _schema = new Schema({
                name: {
                    required: true,
                    type: "String",
                },
                active: {
                    required: true,
                    polymorphic: [{type: "Boolean"}, {type: "Number"}],
                }
            });
        });

        it("should create an observer", function() {
            ObserverBuilder.create('active', _schema);
            _observer = ObserverBuilder.getInstance().get('active');
            expect(typeof _observer.subscribe).to.equal("function");
        });

        it("should subscribe to observer and get value", function(done) {
            const _f = (o) => {
                o.should.eq(true);
                done();
            };
            _schema.subscribe('active', _f);
            _schema.model = {
                name: "item-A",
                active: true
            };
        });
    });
});