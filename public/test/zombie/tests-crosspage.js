var Browser = require('zombie');
var assert = require('chai').assert;

var browser;

suite('Cross-Page Tests', function() {
	setup(function() {
		browser = new Browser();
	});

	test('requesting login from the index page', function(done) {
		var referrer = 'http://localhost:3000/index';
		browser.visit(referrer, function() {
			browser.clickLink('nav a[href="/login"]', function() {
				browser.assert.element('form input[name=referrer]', referrer);
				done();
			});
		});
	});

	test('requesting login from the reg page', function(done) {
		var referrer = 'http://localhost:3000/reg'
		browser.visit(referrer, function() {
			browser.clickLink('nav a[href="/login"]', function() {
				browser.assert.element('form input[name=referrer]', referrer);
				done();
			});
		});
	});

	test('visiting the login page dirctly should result ' +
		'in an empty referrer field', function(done) {
			browser.visit('http://localhost:3000/login', function() {
				browser.assert.element('form input[name=referrer]', '');
				done();
			});
	});
})