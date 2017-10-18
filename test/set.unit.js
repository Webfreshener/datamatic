import { should, expect } from 'chai';
let {Set} = require( "./src/set.js" );;
should();

describe('Set Class Test Suite', function() {
    describe("Initialization Tests", function() {
        "use strict";
        it("should initialize without a type", function() {
            let _set = new Set();
            (_set instanceof Set).should.eq(true);
        });

        it("should initialize with typeof <String>", function() {
            let _set = new Set("String");
            (_set instanceof Set).should.eq(true);
        });

        it("should initialize with typeof <Number>", function() {
            let _set = new Set("Number");
            (_set instanceof Set).should.eq(true);
        });

        it("should initialize with typeof <Object>", function() {
            let _set = new Set("Object");
            (_set instanceof Set).should.eq(true);
        });

        it("should initialize with special type '*'", function() {
            let _set = new Set("*");
            (_set instanceof Set).should.eq(true);
        });

        it("should not initialize with invalid type", function() {
            expect(function() { new Set("INVALID") }).to.throw("could not determine type <INVALID>");
        });
    });

    describe("Validation Tests", function() {
        "use strict";
        it("should validate for Strings", function() {
            let _set = new Set("String");
            _set.addItem(1);
            _set.length.should.equal(0);
            _set.addItem("1");
            _set.length.should.equal(1);
        });

        it("should validate for Numbers", function() {
            let _set = new Set("Number");
            _set.addItem("1");
            _set.length.should.equal(0);
            _set.addItem(1);
            _set.length.should.equal(1);
        });
    });

    describe("Method Tests", function() {
        "use strict";
        let _set = new Set("*");
        it("should add items with addItems", function() {
            _set.addItem("A String");
            _set.length.should.equal(1);
        });

        it("should get an item with getItemAt", function() {
            _set.getItemAt(0).should.equal("A String");
        });

        it("should replace items with replaceItemAt", function() {
            _set.replaceItemAt(0, "New String");
            _set.length.should.equal(1);
            _set.getItemAt(0).should.equal("New String");
        });

        it("should remove items with removeItemAt", function() {
            _set.removeItemAt(0);
            _set.length.should.equal(0);
        });

        it("should push items with push", function() {
            _set.push("one potato", "two potato", "three potato", "four");
            _set.length.should.equal(4);
        });

        it("should remove and return the first item from the list with shift", function() {
            let _val = _set.shift();
            _val.should.equal("one potato");
            _set.length.should.equal(3);
        });

        it("should remove and return the last item from the list with pop", function() {
            let _val = _set.pop();
            _val.should.equal("four");
            _set.length.should.equal(2);
        });

        it("should insert items to the beginning of the list with unshift", function() {
            _set.unshift("four potato", "five potato");
            _set.model[1].should.equal("five potato");
            _set.length.should.equal(4);
        });
        it("should reset list to an empty array with reset", function() {
            _set.reset();
            _set.length.should.equal(0);
        });
    });

    describe("rxjs tests", ()=> {
        it("should subscribe observers", (done)=> {
            let _set = new Set("Number");
            _set.subscribe({
                next: (v) => {
                    v.length.should.eq(1);
                    v[0].should.eq(123);
                },
                error: (e) => {
                    e.should.eq("item at index 1 had wrong type");
                    done()
                }
            });
            _set.addItem(123);
            _set.addItem("fail");
        });
    });

});