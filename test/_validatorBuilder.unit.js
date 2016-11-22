import { should, expect } from "chai";
import {ValidatorBuilder} from "./src/_validatorBuilder.js";
should();

describe( "ValidatorBuilder Unit Test Suite", ()=> {
	var builder = new ValidatorBuilder();
	describe( "Builder Methods", ()=> {
		it( "should  `create` a validator", function() {
			expect(typeof builder.create({type:"Number"}, "key")).to.equal( "function" );
		});
		it( "should `list` it's validators", function() {
			builder.list().length.should.equal( 1 );
		});
		it( "should `exec` it's validators", function() {
			builder.exec('key', 'test').should.equal(
				"key requires Number type was '<String>'" );
			builder.exec('key', 100).should.equal( true );
		});
	});
});