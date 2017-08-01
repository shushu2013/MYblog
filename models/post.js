var mongodb = require('./db');
var getDate = require('./tlib').getDate;

function Post(username, post, time) {
	this.user = username;
	this.post = post;
	this.up = 0;
	this.down = 0;

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
		time: this.time,
		up: this.up,
		down: this.down
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
						down: doc.down
					};
					posts.push(post);
				});
				callback(null, posts);
			});
		});
	});
};

Post.update = function update(username, id, flag, callback) {
	if (!username || !id) {
		return callback('username and id is necessary!');
	}

	if (flag != 'up' && flag != 'down') {
		return callback('flag must be up or down!');
	}

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
				collection.update(query,{$inc: {up: 1}},function(err,post) {
					mongodb.close();
					callback(err, post);
				});
			} else {
				collection.update(query,{$inc: {down: 1}},function(err,post) {
					mongodb.close();
					callback(err, post);
				});
			}

		});
	});
};