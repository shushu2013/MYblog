var mongodb = require('./db');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.imgurl = user.imgurl || null;
	this.motto = user.motto || null;
	this.desc = user.desc || null;
}
module.exports = User;

User.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var user = {
		name: this.name,
		password: this.password,
		imgurl: this.imgurl,
		motto: this.motto,
		desc: this.desc
	};

	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}

		// 读取 users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// 为 name 属性添加索引
			collection.ensureIndex('name', {unique: true});
			//写入 user 文档
			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
};

User.prototype.update = function update(callback) {
	//　更新　user 的数据
	var user = {
		name: this.name,
		password: this.password,
		imgurl: this.imgurl,
		motto: this.motto,
		desc: this.desc
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取　users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.update({name:user.name},user,function(err, user) {
				mongodb.close();
				callback(err, user);
			} );
		});
	});


};

User.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取 users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 name 属性为 username 的文档
			collection.findOne({name: username}, function(err, doc) {
				mongodb.close();
				if (doc) {
					// 封装文档为 User 对象
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};