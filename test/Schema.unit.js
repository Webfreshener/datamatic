import { should, expect } from 'chai';
let {Schema} = require( '../lib/schemaroller' ).SchemaRoller();
should();

describe('Schema Class Test Suite', function() {
  it('should only allow elements for a schema object', () => {
    expect(() => new Schema({value:'test'})).to.throw("value for schema element 'value' has invalid type '<Test>'"); //"type '<Test>' for schema element 'value.type' was invalid"
    expect(() => new Schema({value:'String'})).to.not.throw("schema element was malformed");
    expect(() => new Schema({value: {foo:'test'
    	}}) ).to.throw("value for schema element 'value' was malformed. Property 'type' was missing");
    expect(() => new Schema({value: {type:'String'
    	}}) ).to.not.throw("value for schema element 'value' was malformed. Property 'type' was missing");
    let o = {value: {type:'String', foo: 'test'}};
    expect(() => new Schema(o)).to.throw("schema element 'value.foo' is not allowed");
    expect(() => new Schema(o, {extensible:true})).to.throw("type '<test>' for schema element \'value.foo\' was invalid");
    o.value.foo = 'String';
    return expect(() => new Schema(o, {extensible:true})).to.not.throw("schema element 'value.foo' is not allowed");
  }
  );

  it('should validate data set to it', function() {
    let _S = new Schema({elements: { value:'String'
  }});
    (_S.set({value:1}) instanceof Schema).should.be.false;
    (_S.set({value:"1"}) instanceof Schema).should.be.true;
    _S = new Schema({elements: { value:'Number'
  }});
    (_S.set({value:1}) instanceof Schema).should.be.true;
    return (_S.set({value:"A String"}) instanceof Schema).should.be.false;
  });
    
  it('should only allow valid types', () => {
    return expect(() => new Schema({value: {type:'Nada'
  }}) ).to.throw("value for schema element 'value' has invalid type '<Nada>'");
  }
  );
    
  it('should init with valid schema', () => {
    return expect(() => new Schema({value: {type:'String'
  }}) ).to.not.throw("invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'");
  }
  );
  
  it('should allow a function type', () => {
    return expect(() => new Schema({ value: {type() {}
  }}) ).to.not.throw("invalid schema element 'type' requires one of [String,Function,Object] type was \'<Function>\'");
  }
  );

  it('should validate values', () => {
    let _getter;
    let _S = new Schema({elements: { value: 'String'
  }});
    expect(_getter = _S.set('value', 'test').get).to.exist;
    return (_getter('value')).should.equal('test');
  }
  );

  it('should initialize from schema file', () => {
    let _s = require("./schemas/simple.json");
    // expect(=> new Schema name: {type: "String", restrict: "^(\b(?:(?:$"}).to.throw "Regular Expression provided for 'name.restrict' was invalid"
    return expect(() => new Schema(_s)).to.not.throw("type '<^[a-zA-Z-0-9_]+$>' for schema element 'name.restrict' was invalid");
  }
  );

  it('should initialize from complex schema files', () => {
    let _client;
    let _s = require("./schemas/_loopback.json");
    (this.schema = new Schema(_s));
    // _s = require "./schemas/client.json"
    return expect((_client = new Schema(require("./schemas/client.json"))) instanceof Schema).to.be.true;
  }
  );
  it('should check for required fields', () => {
    let _d =       
      {name: 'Test'};
    return expect(this.schema.set(_d)).to.eq("required property 'properties' is missing for 'root element'");
  }
  );
    
  it('should check for valid properties', () => {
    let _d = {       
      name: 'Test',
      properties: [],
      foo: {}
    };
    expect(this.schema.set(_d) instanceof Schema).to.be.false;
    return expect(this.schema.set(_d)).to.eq("'properties' was invalid");
  }
  );
    
  it('should check for required fields on elements', () => {
    let _d = {       
      name: 'Test',
      options: {
        idInjection: true
      },
      properties: {
        foo: {
          type: "String",
          required: true
        }
      }
    };
    let res = this.schema.set(_d);
    expect(res instanceof Schema).to.be.true;
    
    _d = Object.assign(_d, { properties: {
      type: "Boolean",
      name: "Test"
    }
  }
    );
    return expect(() => this.schema.set(_d)).to.not.throw("required property 'type' is missing");
  }
  );

  it('should set values on elements', () => {
    let _opts;
    (typeof (_opts = this.schema.get('options')) === 'object').should.be.true;
    console.log(_opts);
    return (_opts.get('idInjection')).should.be.true;
  }
  );
    
  return it('should handle deep object nesting', () => {
    let _schema;
    let _d;
    expect((_schema = new Schema(require("./schemas/nested-elements.json"))) instanceof Schema).to.be.true;
    expect((_schema.set(_d = require("./data/nested-data.json"))).valueOf().NestedObjects).to.exist;
    return expect(JSON.stringify(_d)).to.equal(_schema.toString());
  }
  );
});
    
  // # TO-DO:
  // it 'should handle defaults and restrictions', =>
    // _s = 
      // elements:
        // foo:
          // type: 'String'
          // restrict: '^[a-zA-Z0-9\\\s\\\.]{1,}$'
          // # default: 'Hello World'
          // required: false
    // @schema = new Schema _s
    // @schema.set foo:'Goodnight Moon?'
    // expect(@schema.get 'foo').to.not.exist
    // @schema.set foo:'Goodnight Moon'
    // expect(@schema.get 'foo').to.eq 'Goodnight Moon'
// 
  // it 'should set a value to the schema', =>
    // _s = require "./schemas/simple.json"
    // @schema = new Schema _s
    // ((@schema.set 'name', 'Test') instanceof Schema).should.be.true
// 
  // it 'should get a value from the schema', =>
    // (@schema.get 'name').should.equal 'Test'
