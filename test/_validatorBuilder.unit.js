import { should, expect } from "chai";
import {ValidatorBuilder} from "./src/_validatorBuilder.js";
should();

describe( "ValidatorBuilder Unit Test Suite", ()=> {
	var builder = new ValidatorBuilder();
	describe( "Builder Methods", ()=> {
		it( "should `create` a validator", function() {
			expect(typeof builder.create({type:"Number"}, "key")).to.equal( "function" );
		});
		it( "should `create` a validator for a polymorphic element", function() {
			let _ = {
					polymorphic: [{
						type: "Boolean"
					},
					{
						type: "Number"
					}]
			};
			let _b = builder.create(_, "polymorphic");
			expect(typeof _b).to.equal( "function" );
		});
		it( "should `list` it's validators", function() {
			builder.list().length.should.equal( 2 );
		});
		it( "should `exec` it's validators", function() {
			builder.exec('key', 'test').should.equal(
				"key requires Number type was '<String>'" );
			builder.exec('key', 100).should.equal( true );
		});
		it( "should `exec` it's polymorphic validators", function() {
			builder.exec('polymorphic', 'test').should.equal(
				"polymorphic requires Number type was '<String>'" );
			builder.exec('polymorphic', 100).should.equal( true );
			builder.exec('polymorphic', false).should.equal( true );
		});
	});
});