var Locals = require('../../../routes/locals');
var expect = require('chai').expect;

suite('Locals tests', function() {
	var locals = new Locals();
	test('new Locals should return a object', function() {
		expect(typeof locals === 'object');
	});

	test('new Locals property pageTestScript should be null', function() {
		expect(locals.pageTestScript === null);
	});
});