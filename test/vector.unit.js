import { should, expect } from 'chai';
let {Vector} = require( "./src/vector.js" );;
should();

describe('Vector Class Test Suite', function() {
    describe("Initialization Tests", function() {
        "use strict";
        it("should initialize without a type", function() {
            let _vector = new Vector();
            (_vector instanceof Vector).should.eq(true);
        });

        it("should initialize with typeof <String>", function() {
            let _vector = new Vector("String");
            (_vector instanceof Vector).should.eq(true);
        });

        it("should initialize with typeof <Number>", function() {
            let _vector = new Vector("Number");
            (_vector instanceof Vector).should.eq(true);
        });

        it("should initialize with typeof <Object>", function() {
            let _vector = new Vector("Object");
            (_vector instanceof Vector).should.eq(true);
        });

        it("should initialize with special type '*'", function() {
            let _vector = new Vector("*");
            (_vector instanceof Vector).should.eq(true);
        });

        it("should not initialize with invalid type", function() {
            expect(function() { new Vector("INVALID") }).to.throw("could not determine type <INVALID>");
        });
    });

    describe("Validation Tests", function() {
        "use strict";
        it("should validate for Strings", function() {
            let _vector = new Vector("String");
            _vector.addItem(1);
            _vector.length.should.equal(0);
            _vector.addItem("1");
            _vector.length.should.equal(1);
        });

        it("should validate for Numbers", function() {
            let _vector = new Vector("Number");
            _vector.addItem("1");
            _vector.length.should.equal(0);
            _vector.addItem(1);
            _vector.length.should.equal(1);
        });
    });

    describe("Method Tests", function() {
        "use strict";
        let _vector = new Vector("*");
        it("should add items with addItems", function() {
            _vector.addItem("A String");
            _vector.length.should.equal(1);
        });

        it("should get an item with getItemAt", function() {
            _vector.getItemAt(0).should.equal("A String");
        });

        it("should replace items with replaceItemAt", function() {
            _vector.replaceItemAt(0, "New String");
            _vector.length.should.equal(1);
            _vector.getItemAt(0).should.equal("New String");
        });

        it("should remove items with removeItemAt", function() {
            _vector.removeItemAt(0);
            _vector.length.should.equal(0);
        });

        it("should push items with push", function() {
            _vector.push("one potato", "two potato", "three potato", "four");
            _vector.length.should.equal(4);
        });

        it("should remove and return the first item from the list with shift", function() {
            let _val = _vector.shift();
            _val.should.equal("one potato");
            _vector.length.should.equal(3);
        });

        it("should remove and return the last item from the list with pop", function() {
            let _val = _vector.pop();
            _val.should.equal("four");
            _vector.length.should.equal(2);
        });

        it("should insert items to the beginning of the list with unshift", function() {
            _vector.unshift("four potato", "five potato");
            _vector.getItemAt(1).should.equal("five potato");
            _vector.length.should.equal(4);
        });
        it("should reset list to an empty array with reset", function() {
            _vector.reset();
            _vector.length.should.equal(0);
        });
    });

});