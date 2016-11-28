import { should, expect } from 'chai';
let {Vector} = require( '../lib/schemaroller' ).SchemaRoller();
should();

describe('Vector Class Test Suite', function() {
	it("should not allow Elements without a type or type parameter", function() {
		let _vector = new Vector(['String']);
		(_vector instanceof Vector).should.eq(true);
	});
});