var mongodb = require('./db');
var getDate = require('./tlib').getDate;

function Setting(username, setting, time) {
	this.user = username;
	this.setting = setting;

	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
}

module.exports = Setting;

Setting.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var setting = {
		user: this.user,
		setting: this.setting,
		time: this.time
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		// 读取 setting 集合
		db.collection('settings', function(err, collection) {
			if (err) {
				return callback(err);
			}

			// 为 user 属性添加唯一索引
			collection.ensureIndex({"user":1}, {"unique":true});

			// 更新写入 settings 文档，如果不存在则创建，存在则更新
			collection.update({"user":setting.user}, setting, {upsert: true},function(err, setting) {
				mongodb.close();
				callback(err, setting);
			});
		});
	});
};

Setting.get = function get(username, callback) {
	if (username) {
		return callback('用户名不能为空');
	}

	mongodb.open(function(err, db) {
		if (err) {
			callback(err);
		}

		// 读取 setting
		db.collection('settings', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {user: username};
			// 查找 user 属性为 username 的文档
			collection.findOne(query, function(err, setting) {
				if (err) {
					callback(err);
				}

				callback(null, setting);
			});
			
		});
	});
};