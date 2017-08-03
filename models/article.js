var mongodb = require('./db');
var markdown = require('markdown').markdown;
var getDate = require('./tlib').getDate;

function Article(username, title, text, html, time) {
	this.user = username;
	this.title = title;
	this.text = text;
	this.html = html;
	this.up = 0;
	this.view = 0;
	this.whoups = [];

	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
}

module.exports = Article;

Article.prototype.save = function save(callback) {
	var article = {
		user: this.user,
		title: this.title,
		text: this.text,
		html: this.html,
		up: this.up,
		view: this.view,
		whoups: this.whoups,
		time: this.time
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 articles 集合
		db.collection('articles', function(err, collection) {
			if (err) {
				return callback(err);
			}

			// 为 user 属性添加索引
			collection.ensureIndex('user');
			// 写入 article 文档
			collection.insert(article, {safe: true}, function(err, article) {
				mongodb.close();
				callback(err, article);
			});
		});
	});
};

Article.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取 articles 集合
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 查找 user 属性为 username 的文章，如果 username 是 null 则匹配全部
			var query = {};
			if (username) {
				query.user = username;
			}

			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					callback(err, null);
				}
				// 封装 articles 为 Article 对象数组
				var articles = [];
				docs.forEach(function(doc, index) {
					// 处理文章预览
					var preview = doc.text.substr(0, 100).replace(/\[TOCM?\]|#|\r\n/g,'');
					preview = doc.text.length > 100 ? preview + '...' : preview;

					var article = {
						user: doc.user,
						title: doc.title,
						text: markdown.toHTML(preview),
						html: doc.html,
						up: doc.up,
						view: doc.view,
						time: getDate(doc.time)
					};
					articles.push(article);
				});
				callback(null, articles);
			});
		});
	});
};