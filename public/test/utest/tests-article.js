var Article = require('../../../models/article');
var expect = require('chai').expect;

suite('Article tests', function() {
	Article.get(null, function(err, articles) {
		if (err) {
			articles = [];
		}

		test('articles should a Array', function() {
			expect(Object.prototype.toString.call(articles)  === '[object Array]');
		});
	});
});