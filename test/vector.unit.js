import { should, expect } from 'chai';
let {Vector} = require( "./src/vector.js" );;
should();

describe('Vector Class Test Suite', function() {
	it("should not allow Elements without a type or type parameter", function() {
		let _vector = new Vector([{type:'String'}]);
		(_vector instanceof Vector).should.eq(true);
	});
});