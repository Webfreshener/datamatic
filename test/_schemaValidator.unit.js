import { should, expect } from "chai";
import {SchemaValidator} from "./src/_schemaValidator.js";
should();

describe( "SchemaValidator Unit Test Suite", ()=> {
	var validator = new SchemaValidator();
	describe( "String Type Validation", ()=> {
		it( "should validate String Type", function() {
			// type "String" should be defined and valid
			expect(validator.validateTypeString("key", "string")).to.equal( true );
			// random string value should not be valid
			expect(validator.validateTypeString("key", "a string")).to.equal( 
					"type '<a string>' for schema element 'key' was invalid" );
		});
		it( "should ignore default value key", function() {
			// type "String" should be defined and valid
			expect( validator.validateTypeString("default", "string") ).to.equal( true );
			// random string value should not be valid
			expect( validator.validateTypeString("default", "a string") ).to.equal( true );
		});
		it( "should reject non-regexp restrictions", function() {
			expect( validator.validateTypeString("restrict", 1) ).to.equal(
					"restrict requires a Regular Expression String");
		});
		it( "should reject invalid regexp restrictions", function() {
			expect( validator.validateTypeString("restrict", "[a-z0-9\.\-") ).to.equal(
				"Regular Expression provided for 'restrict' was invalid. SyntaxError: Invalid regular expression: /[a-z0-9.-/: Unterminated character class"	);
			expect( validator.validateTypeString("restrict", "") ).to.equal( 
				"restrict requires a Regular Expression String");
		});
		it( "should accept valid regular expression as key restriction", function() {
			expect( validator.validateTypeString("restrict", "[a-z0-9]\.\-]") ).to.equal( true );

		});
	});
	describe("Validate Schema Param String", ()=> {
		it( "should accept valid Param Keys", function() {
			// String is a valid Native Object Type
			expect( validator.validateSchemaParamString("key", "type", {type:"String"}) ).to.equal( true );
			// FooBar is not defined and should not pass
			expect( validator.validateSchemaParamString("key", "type", {type:"FooBar"}) ).to.equal( 
					"type \'<FooBar>\' for schema element \'key.type\' was invalid" );
		});	
		it( "should allow arbiterary Param keys if extensible", function() {
			let _validator = new SchemaValidator({}, {extensible:true}); 
			expect( _validator.validateSchemaParamString("key", "newAttr", {newAttr:"String"}) ).to.equal( true );
		});	
		it( "should accept valid Param Types", function() {
			// String is a valid Native Object Type
			expect( validator.validateSchemaParamString("key", "type", {type:"String"}) ).to.equal( true );
			// FooBar is not defined and should not pass
			expect( validator.validateSchemaParamString("key", "type", {type:"FooBar"}) ).to.equal( 
					"type \'<FooBar>\' for schema element \'key.type\' was invalid" );
		});	
	});
	describe( "Validate Schema Entries", ()=> {
		it( "should accept Booleans", function() {
			expect( validator.validateSchemaEntry("key", false) ).to.equal( true );
		});
		it( "should accept Strings", function() {
			expect( validator.validateSchemaEntry("key", "String") ).to.equal( true );
		});
		it( "should accept Objects", function() {
			expect( validator.validateSchemaEntry("key", "Object") ).to.equal( true );
		});
		it( "should accept Typed Members", function() {
			// this should be good -- note the type value in the 2nd argument
			expect( validator.validateSchemaEntry("key", {type:"String"}) ).to.equal( true );
			// this has no such value...
			expect( validator.validateSchemaEntry("key", {}) ).to.equal( 
					"value for schema element \'key\' was malformed. Property \'type\' was missing");
		});
	});
	describe( "Untyped Members Validation", ()=> {
		it( "should accept no type on `elements` param", function() {
			expect( validator.validateUntypedMembers("elements", {something:"String"}) ).to.equal( true );
		});
		it( "should accept no type on `default` param", function() {
			expect( validator.validateUntypedMembers("default", {something:"String"}) ).to.equal( true );
		});
		it( "should NOT accept typeless `key` param", function() {
			expect( validator.validateUntypedMembers("key", {something:"String"}) ).to.equal( 
					"value for schema element \'key\' was malformed. Property \'type\' was missing");
		});
		it('should test for types on arrays', function() {
			// this should always be ok
			expect( validator.validateUntypedMembers("key", [{type:"String"},{type:"Number"}] ) ).to.equal( true );
			// this has missing type attribute on last member and must fail
			expect( validator.validateUntypedMembers("key", [{type:"String"},{invalid:"Non-Type"}] ) ).to.equal( 
					"value for schema element \'key\' was malformed. Property \'type\' was missing" );
			// this has invalid `type` 'Non-Type' and must fail
			expect( validator.validateUntypedMembers("key", [{type:"String"},{type:"Non-Type"}] ) ).to.equal( 
					"value for schema element 'key' has invalid type '<Non-Type>'" );
		})
	});
});
