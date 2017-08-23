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
	this.id = 0;

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
		time: this.time,
		id: this.id
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

			// 文章 id 代表第几篇博文
			article.id = collection.count();
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
						id: doc._id,
						user: doc.user,
						title: doc.title,
						text: markdown.toHTML(preview),
						html: doc.html,
						up: doc.up,
						view: doc.view,
						time: getDate(doc.time),
						url: "/u/" + doc.user + "/essay/" + doc._id
					};
					articles.push(article);
				});
				callback(null, articles);
			});
		});
	});
};

Article.getOnly = function getOnly(username, id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　articles 集合
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 查找　user 属性为　username, _id 属性为　id 的文档
			var query = {
				_id: id,
				user: username
			};

			// 更新浏览量
			collection.findOneAndUpdate(query, {$inc: {view: 1}}, function(err, doc) {
				mongodb.close();
				if (doc) {
					var article = {
						id: doc.value._id,
						user: doc.value.user,
						title: doc.value.title,
						html: doc.value.html,
						up: doc.value.up,
						view: doc.value.view,
						time: getDate(doc.value.time),
						essayid: doc.value.id
					};
					callback(null, article);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

// 获取文章链接
Article.getLink = function(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　articles 集合
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 查找　id 属性
			var query = {
				id: id
			};
			
			collection.findOne(query, function(err, doc) {
				mongodb.close();
				if (doc) {
					var url = {
						id: doc._id,
						user: doc.user,
						title: doc.title
					};
					callback(null, url);
				} else {
					callback(err, null);
				}
			});

		});

	});
};

// 获取上下篇文章链接
Article.getPreNextLink = function(id, callback) {
	var url = {
		pre: null,
		next: null
	};

	Article.getLink(id - 1, function(err, preurl) {
		if (preurl) {
			url.pre = preurl;
		}

		Article.getLink(id + 1, function(err, nexturl) {
			if (nexturl) {
				url.next = nexturl;
			}

			callback(null, url);
		});
	});
};

// 更新阅读量
Article.updateUp = function updateUp(username, id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　articles　集合
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {
				_id: id,
				user: username
			};

			collection.update(query, {$inc: {up: 1}}, function(err, article) {
				mongodb.close();
				callback(err, article);
			});
		});
	});
};