import { should, expect } from "chai";
import {BaseValidator, Validator, ValidatorBuilder} from "./src/_validators.js";
const _signature = require("./fixtures/polymorphic_sig.schema.json");
should();

describe( "Validators Unit Test Suite", ()=> {
	ValidatorBuilder.getInstance().create({type:"String"}, "aString");
	ValidatorBuilder.getInstance().create({type:"Number"}, "aNumber");
	ValidatorBuilder.getInstance().create({type:"Boolean"}, "aBool");
	describe( "BaseValidator", ()=> {
		var _sig  = {type:"String"};
		var _base = new BaseValidator("root", _sig);
		it("should have a path signature", ()=> {
			_base.path.should.eq("root");
		});
		it("should have a valid signature", ()=> {
			_base.signature.should.eq(_sig);
		});
		it("should call validators", function() {
			_base.call("aString", 1).should.eq("'aString' expected string, type was '<number>'");
			_base.call("aString", true).should.eq("'aString' expected string, type was '<boolean>'");
			_base.call("aString", "ok").should.be.true;
			
		});
		it("should call check types", function() {
			_base.checkType("string", 1 ).should.eq("'root' expected string, type was '<number>'");
			_base.checkType("string", "ok" ).should.be.true;
			_base.checkType(String, "ok" ).should.be.true;
		});
	});
	
	describe( "Validation Constructors", ()=> {
		it("should validate numbers", ()=> {
			let _ = new Validator.Number("numTest", {type:"Number"});
			_.exec("invalid").should.eq("'numTest' expected number, type was '<string>'");
			_.exec(true).should.eq("'numTest' expected number, type was '<boolean>'");
			_.exec(1).should.be.true;
		});
		
		it("should validate strings", ()=> {
			let _ = new Validator.String("strTest", {type:"String"});
			_.exec(1).should.eq("'strTest' expected string, type was '<number>'");
			_.exec(true).should.eq("'strTest' expected string, type was '<boolean>'");
			_.exec("ok").should.be.true;
		});
		
		it("should validate booleans", ()=> {
			let _ = new Validator.Boolean("boolTest", {type:"Boolean"});
			_.exec(1).should.eq("'boolTest' expected boolean, type was '<number>'");
			_.exec("invalid").should.eq("'boolTest' expected boolean, type was '<string>'");
			_.exec(false).should.be.true;
		});	
		
	});
	
	describe( "Object Validation", ()=> {
		it("should validate basic objects", ()=> {
			var _value;
			let _sig = {
					type: "Object",
					elements: {
						aString: {
							type: "String"
						},
						aNumber: {
							type: "Number"
						}
					}
			}
			let _ = new Validator.Object("objTest", _sig);
			_value = {aString: true, aNumber: 1 };
			_.exec( _value ).should.eq("'objTest.aString' expected string, type was '<boolean>'");
			_value = {aString: "ok", aNumber: 1 };
			_.exec( _value ).should.be.true;
		});
	});
	
});
