(chai     = require 'chai').should()
expect    = chai.expect
{Hash}    = require '../src/strictly-hash'
describe 'Hash Class Test Suite', ->
  it 'should get values from an object', =>
    (new Hash value:'test').get('value').should.equal 'test'
  it 'should set values to the Hash', =>
    (new Hash).set('value', 'test').get('value').should.equal 'test'
  it 'should set list keys in the Hash', =>
    (hash = new Hash).set('value', 'test')
    hash.keys()[0].should.equal 'value'
  it 'should delete an item in the Hash', =>
    (hash = new Hash value:'test', invalid:true).del('invalid')
    expect(hash.get 'invalid').to.equal undefined
  it 'should restrict values based on array', =>
    expect((new Hash {},['value']).set('illegal', true).get('illegal')).to.equal undefined
  it 'should freeze', =>
    (hash = new Hash value:'you can\'t touch this').freeze().isFrozen().should.equal  true
    expect((=>hash.set 'value','it\'s Hammer Time!')).to.throw "Cannot assign to read only property 'value' of #<Object>"
    hash.get('value').should.equal 'you can\'t touch this'
  it 'should seal', =>
    (hash = new Hash value:'you can\'t touch this').seal().isSealed().should.equal  true
    expect((=> hash.set 'something',(->false))).to.throw "Can't add property something, object is not extensible"
  it 'should prevent extension', =>
    (hash = new Hash value:'you can\'t touch this').preventExtensions().isExtensible().should.equal  false
    expect((=> hash.set 'something',(->false))).to.throw "Can't add property something, object is not extensible"
  it "should provide it's value", =>
    (new Hash {value:'test'},['value']).valueOf().value.should.equal 'test'
  it "should provide toJSON", =>
    (new Hash {value:'test'},['value']).toJSON().value.should.equal 'test'
  it "should provide toString", =>
    (new Hash {value:'test'},['value']).toString().should.be.a 'string'