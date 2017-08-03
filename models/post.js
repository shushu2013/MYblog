var mongodb = require('./db');
var getDate = require('./tlib').getDate;

function Post(username, post, time) {
	this.user = username;
	this.post = post;
	this.up = 0;
	this.down = 0;
	this.whoups = [];
	this.whodowns = [];

	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
}
module.exports = Post;

Post.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var post = {
		user: this.user,
		post: this.post,
		up: this.up,
		down: this.down,
		whoups: this.whoups,
		whodowns: this.whodowns,
		time: this.time
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				return callback(err);
			}

			// 为 user 属性添加索引
			collection.ensureIndex('user');
			// 写入 post 文档
			collection.insert(post, {safe: true}, function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});

};

Post.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 查找 user 属性为 username 的文档，如果 username 是 null 则匹配全部
			var query = {};
			if (username) {
				query.user = username;
			}

			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				// 封装 posts 为 Post 对象数组
				var posts = [];
				docs.forEach(function(doc, index) {
					var post = {
						id: doc._id,
						user: doc.user, 
						post: doc.post, 
						time: getDate(doc.time),
						up: doc.up,
						down: doc.down,
						whoups: doc.whoups,
						whodowns: doc.whodowns
					};
					posts.push(post);
				});
				callback(null, posts);
			});
		});
	});
};


Post.getOnly = function getOnly(username, id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 查找　user 属性为　username, _id 属性为　id 的文档
			var query = {
				_id: id,
				user: username
			};

			collection.findOne(query, function(err, post){
				mongodb.close();
				if (post) {
					callback(null, post);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

Post.update = function update(username, id, flag, who, callback) {

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {
				_id: id,
				user: username,
			};
			// 根据用户名、唯一 id 标识查找 post
			if (flag == 'up') {
				collection.update(query,{$inc: {up: 1},$push: {whoups: who}},function(err,post) {
					mongodb.close();
					callback(err, post);
				});
			} else {
				collection.update(query,{$inc: {down: 1},$push: {whodowns: who}},function(err,post) {
					mongodb.close();
					callback(err, post);
				});
			}

		});
	});
};