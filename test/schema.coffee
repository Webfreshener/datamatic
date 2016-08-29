{should, expect}  = require 'chai'
{Schema}  = require( '../src/schemeroller' ).SchemaRoller
should()
describe 'Schema Class Test Suite', ->
  it 'should only allow elements for a schema object', =>
    expect(-> new Schema value:'test').to.throw "value for schema element 'value' has invalid type '<Test>'" #"type '<Test>' for schema element 'value.type' was invalid"
    expect(-> new Schema value:'String').to.not.throw "schema element was malformed"
    expect(-> new Schema value:foo:'test').to.throw "value for schema element 'value' was malformed. Property 'type' was missing"
    expect(-> new Schema value:type:'String').to.not.throw "value for schema element 'value' was malformed. Property 'type' was missing"
    o = value: {type:'String', foo: 'test'}
    expect(-> new Schema o).to.throw "schema element 'value.foo' is not allowed"
    expect(=> new Schema o, extensible:true).to.throw "type '<test>' for schema element \'value.foo\' was invalid"
    o.value.foo = 'String'
    expect(-> new Schema o, extensible:true).to.not.throw "schema element 'value.foo' is not allowed"

  it 'should validate data set to it', ->
    _S = new Schema value:'String'
    (_S.set(value:1) instanceof Schema).should.be.false
    (_S.set(value:"A String") instanceof Schema).should.be.true
  it 'should only allow valid types', =>
    expect(-> new Schema value:type:'Number').to.throw "invalid schema element 'value' requires type 'String,Function,Object' type was '<Number>'"
  it 'should init with valid schema', =>
    expect(-> new Schema value:type:'String').to.not.throw "invalid schema element 'value' requires type 'String,Function,Object' type was '<String>'"
  it 'should allow a function type', =>
    expect(-> new Schema( value:type:->)).to.not.throw "invalid schema element 'type' requires one of [String,Function,Object] type was \'<Function>\'"
  it 'should validate values', =>
    (new Schema value:type:'String').set('value', 'test').get('value').should.equal 'test'
    
  it 'should initialize from schema file', =>
    _s = require "./schemas/loopback.json"
    expect(=> new Schema _s).to.not.throw "invalid schema"

  # it 'should set list keys in the Hash', =>
    # (hash = new Hash).set('value', 'test')
    # hash.keys()[0].should.equal 'value'
  # it 'should delete an item in the Hash', =>
    # (hash = new Hash value:'test', invalid:true).del('invalid')
    # expect(hash.get 'invalid').to.equal undefined
  # it 'should restrict values based on array', =>
    # expect((new Hash {},['value']).set('illegal', true).get('illegal')).to.equal undefined
  # it 'should restrict values based on type', =>
    # expect((new Hash {value:1},[], {value:"typeof:string"}).get('value')).to.equal undefined
    # expect((new Hash {value:1},[], {value:"typeof:object"}).get('value')).to.equal undefined
    # expect((new Hash {value:1},[], {value:"typeof:number"}).get('value')).to.equal 1
  # it 'should cast values to a type', =>
    # expect((new Hash {value:1},[], {value:"cast:String"}).get('value')).to.equal '1'
  # it 'should create class from values', =>
    # _h = new Hash {value:{foo:'bar'}}, [], {value:'class:Hash'}
    # expect(_h.get('value').get 'foo').to.equal 'bar'
  # it 'should freeze', =>
    # (hash = new Hash value:'you can\'t touch this').freeze().isFrozen().should.equal  true
    # expect((=>hash.set 'value','it\'s Hammer Time!')).to.throw "Cannot assign to read only property 'value' of object '#<Object>'"
    # hash.get('value').should.equal 'you can\'t touch this'
  # it 'should seal', =>
    # (hash = new Hash value:'you can\'t touch this').seal().isSealed().should.equal  true
    # expect((=> hash.set 'something',(->false))).to.throw "Can't add property something, object is not extensible"
  # it 'should prevent extension', =>
    # (hash = new Hash value:'you can\'t touch this').preventExtensions().isExtensible().should.equal  false
    # expect((=> hash.set 'something',(->false))).to.throw "Can't add property something, object is not extensible"
  # it "should provide it's value", =>
    # (new Hash {value:'test'},['value']).valueOf().value.should.equal 'test'
  # it "should provide toJSON", =>
    # (new Hash {value:'test'},['value']).toJSON().value.should.equal 'test'
  # it "should provide toString", =>
    # (new Hash {value:'test'},['value']).toString().should.be.a 'string'
  # it 'should keep hashes discrete', =>
    # one = new Hash {value:"foo"}
    # two = new Hash {value:"bar"}
    # one.get('value').should.equal 'foo'
    # two.get('value').should.equal 'bar'
