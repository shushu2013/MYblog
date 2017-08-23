var Post = require('../models/post');
var Article = require('../models/article');
var User = require('../models/user');
var ObjectID = require('mongodb').ObjectID;

// 微言点赞
exports.dosay = function(req, res) {
	var username = req.query.username;
	var id = ObjectID(req.query.id);
	var flag = req.query.flag;
	var who = req.session.user.name;

	if (!username || !id) {
		return res.status(400).send({err: 'username and id is necessary!'});
	}

	if (flag != 'up' && flag != 'down') {
		return res.status(400).send({err: 'flag must be up or down!'});
	}

	// 判断点赞的用户是否存在
	User.get(who, function(err, user) {
		if(!user) {
			return res.status(400).send({err: '请先登录！'});
		}

		// 判断被点赞微文是否存在
		Post.getOnly(username, id, function(err, post) {
			if(err) {
				return res.status(400).send({err: "该微文不存在！"});
			}

			// 判断用户是否点过赞
			post.whoups = post.whoups || [];
			post.whodowns = post.whodowns || [];
			var judge = flag == 'up' ? post.whoups : post.whodowns;
			console.log(judge.length);
			console.log(post);
			if(judge.indexOf(who) !== -1) {
				return res.status(400).send({err:'亲，您已经点过了!',flag: 4});
			}

			Post.update(username, id, flag, who, function(err) {
				if (err) {
					res.status(400).send({err: err});
				} else {
					res.status(200).send({suc:'success!'});
				}
			});
		});
	});
};

// 微文分页
exports.dopage = function(req, res) {
	var username = req.params.user;
	var pageNum = parseInt(req.params.number, 10);

	if (typeof pageNum !== 'number' || pageNum < 1) {
		return res.status(400).send({err: 'pageNum must be a positive number!'});
	}

	// 判断用户是否存在
	User.get(username, function(err, user) {
		if (!user) {
			return res.status(400).send({err: '该用户不存在！'});
		}

		// 获得该用户的文章列表
		Article.get(username, function(err, articles) {
			var essays = [];

			if (err) {
				return res.status(400).send({err: '获取文章失败！'});
			}

			if (Math.ceil(articles.length / 6) < pageNum ) {
				return res.status(400).send({err: '没有更多文章了！'});
			}

			essays = articles.slice((pageNum-1) * 6, (pageNum * 6) -1);

			return res.status(200).send({suc: essays});

		});
	});

};