import { should, expect } from "chai";
let {Schema} = require( "../lib/schemaroller" ).SchemaRoller();
should();

describe.only("Schema Class Test Suite", function() {
	it("should not allow Elements without a type or type parameter", function() {
	    expect(() => new Schema({value: {foo:"test"}}) ).to.throw(
	    		"value for schema element 'value' was malformed. Property 'type' was missing");
	});
	it("should not allow Elements with a valid type parameter", function() {
		expect(() => new Schema({value: {type:"String"}}) ).to.not.throw(
				"value for schema element 'value' was malformed. Property 'type' was missing");
	});
	it("should not allow invalid Element Types", () => {
		expect(() => new Schema({value:"test"})).to.throw(
				"value for schema element 'value' has invalid type '<Test>'");
	});
	it("should allow String type", function() {
		expect(() => new Schema({value:"String"})).to.not.throw(
				"schema element was malformed"); 
	});
	it("should allow Numeric type", function() {
		expect(() => new Schema({value:"Number"})).to.not.throw(
				"schema element was malformed"); 
	});    
	it("should allow Boolean type", function() {
		expect(() => new Schema({value:"Boolean"})).to.not.throw(
				"schema element was malformed"); 
	});
	it("should allow Object type", function() {
		expect(() => new Schema({value:"Object"})).to.not.throw(
				"schema element was malformed"); 
	});
	let o = {
			value: {
				type:"String", 
				foo: "test"
	}};
	it("should accept only valid keys on nested objects", function() {
		expect(() => new Schema(o)).to.throw(
				"schema element 'value.foo' is not allowed");
	});
	it("should ensure only valid types on nested elements", function() {
		expect(() => new Schema(o, {extensible:true})).to.throw(
				"type '<test>' for schema element 'value.foo' was invalid");
	});
	it("should allow propery types elements to be added if schema node is extensible", function() {
	    o.value.foo = "String";
	    expect(() => new Schema(o, {extensible:true})).to.not.throw(
	    		"schema element 'value.foo' is not allowed");
	});

  it("should validate data set to it", function() {
    var _S = new Schema( {
    	elements: { 
    		value:"String" } 
    } );
    (_S.set( {value:1} ) instanceof Schema).should.be.false;
//    (_S.set( {value:"1"} ) instanceof Schema).should.be.true;
//    _S = new Schema({
//    	elements: { 
//    		value:"Number" }});
//    (_S.set({value:1}) instanceof Schema).should.be.true;
//    (_S.set({value:"A String"}) instanceof Schema).should.be.false;
  });
    
  it("should only allow valid types", () => {
    return expect(() => new Schema({value: {type:"Nada"}}) ).to.throw(
    		"value for schema element 'value' has invalid type '<Nada>'");
  });
    
  it("should init with valid schema", () => {
	  expect(() => new Schema({value: {type:"String"}}) ).to.not.throw(
			  "invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'");
  });
  
  it("should allow a function type", () => {
    expect(() => new Schema({ value: {type() {}}}) ).to.not.throw(
    		"invalid schema element 'type' requires one of [String,Function,Object] type was '<Function>'");
  });

  it("should validate values", () => {
    let _S = new Schema({
    		elements: { 
    			value: "String"	}});
    expect( _S.set("value", "test") instanceof Schema ).to.be.true;
    (_S.get("value")).should.equal("test");
  });

  it("should initialize from schema file", () => {
    let _s = require("./fixtures/simple.schema.json");
    // expect(=> new Schema name: {type: "String", restrict: "^(\b(?:(?:$"}).to.throw "Regular Expression provided for "name.restrict" was invalid"
    expect(() => new Schema(_s)).to.not.throw("type '<^[a-zA-Z-0-9_]+$>' for schema element 'name.restrict' was invalid");
  });

  it.only("should initialize from polymorphic schema fixture", () => {
	  let _s = require("./fixtures/polymorphic.schema.json");
    this.schema = new Schema(_s);
    expect(this.schema instanceof Schema).to.be.true;
  });
  
  it("should check for required fields", () => {
    let _d = {
    		name: "Test"};
    expect(this.schema.set(_d)).to.eq(
    		"required property 'description' is missing for 'root element'");
  });
    
  it.only("should check for polymorphic properties", () => {
	let _d = {
			anItem: "should be valid"
	}
    expect(this.schema.set(_d) instanceof Schema).to.be.false;
    expect(this.schema.set(_d)).to.eq(
    		"element 'foo' is not a valid element");
  });
  
  it("should initialize from client_collection schema fixture", () => {
    let _s = require("./fixtures/client_collection.schema.json");
    this.schema = new Schema(_s);
    expect(this.schema instanceof Schema).to.be.true;
  });
  
  it("should check for valid properties", () => {
    let _d = {       
      name: "Test",
      description: "some text here",
      plural: false,
      base: "foo",
      http: false,
      strict: false,
      options: {
    	  idInjection: true,
    	  validateUpsert: false
      },
      validations: {},
      relations: {
    	  myRelation: {
    		  type: "foo",
    		  polymorphic: "testing",
    		  model:"",
    		  foreignKey: "name"
    	  }
      },
      scope: {},
      scopes: {},
      properties: {},
      foo: {}
    };
    expect(this.schema.set(_d) instanceof Schema).to.be.false;
    expect(this.schema.set(_d)).to.eq(
    		"element 'foo' is not a valid element");
  });
    
  it("should check for required fields on elements", () => {
    let _d = {       
	      name: "Test",
	      description: "some text here",
	      plural: false,
	      base: "foo",
	      http: false,
	      strict: false,
	      options: {
	    	  idInjection: true
	      },
	      validations: {},
	      relations: {
	      },
	      scope: {},
	      scopes: {},
	      properties: {}
	    };
    let res = this.schema.set(_d);
    expect(res instanceof Schema).to.be.true;
    
    _d = Object.assign(_d, { properties: {
      type: "Boolean",
      name: "Test"
    }	});
    return expect(() => this.schema.set(_d)).to.not.throw(
    		"required property 'type' is missing");
  });

  it("should set values on elements", () => {
    let _opts = this.schema.get( "options" );
    console.log(`schema obj keys: ${Object.keys(this.schema.valueOf())}`);
    (typeof _opts === "object").should.be.true;
    (_opts.get("idInjection")).should.be.true;
  });
  it("should handle deep object nesting", () => {
    let _schema = new Schema( require("./fixtures/nested-elements.schema.json") );
    expect(_schema instanceof Schema).to.be.true;
//    expect((_schema.set(_d = require("./fixtures/nested.data.json"))).valueOf().NestedObjects).to.exist;
//    return expect(JSON.stringify(_d)).to.equal(_schema.toString());
  });
});
    
  // # TO-DO:
  // it "should handle defaults and restrictions", =>
    // _s = 
      // elements:
        // foo:
          // type: "String"
          // restrict: "^[a-zA-Z0-9\\\s\\\.]{1,}$"
          // # default: "Hello World"
          // required: false
    // @schema = new Schema _s
    // @schema.set foo:"Goodnight Moon?"
    // expect(@schema.get "foo").to.not.exist
    // @schema.set foo:"Goodnight Moon"
    // expect(@schema.get "foo").to.eq "Goodnight Moon"
// 
  // it "should set a value to the schema", =>
    // _s = require "./schemas/simple.json"
    // @schema = new Schema _s
    // ((@schema.set "name", "Test") instanceof Schema).should.be.true
// 
  // it "should get a value from the schema", =>
    // (@schema.get "name").should.equal "Test"
