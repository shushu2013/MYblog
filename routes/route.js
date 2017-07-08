/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

function Locals(req) {

	this.user = req.session.user || null;
	this.success = req.flash('success').toString() || null;
	this.error = req.flash('error').toString() || null;
	this.pageTestScript = null;
}

Locals.prototype.add = function add(key, vlaue) {
	if (key) {
		this[key] = value || null;
	}
}

Locals.prototype.addObj = function add(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]') {
		for(var key in obj) { // 遍历所以可枚举属性
			if (obj.hasOwnProperty(key)) { // 判断是否是自有属性
				this[key] = obj[key];
			}
		}
	}
}



exports.index = function(req, res) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}

		var locals = new Locals(req);
		locals.addObj({
			title: '首页',
			posts: posts,
			pageTestScript: '/test/tests-index.js'
		});

		res.render('index', locals);
		// res.render('index', {
		// 	title: '首页',
		// 	posts: posts,
		// 	user: req.session.user,
		// 	pageTestScript: '/test/tests-index.js',
		// 	success: req.flash('success').toString(),
		// 	error: req.flash('error').toString()
		// });
	});
};

exports.user = function(req, res) {
	var username = req.params.user;

	User.get(username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}

		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			var locals = new Locals(req);
			locals.addObj({
				title: user.name,
				posts: posts,
			});

			res.render('user', locals);

			// res.render('user', {
			// 	title: user.name,
			// 	posts: posts,
			// 	user: req.session.user,
			// 	success: req.flash('success').toString(),
			// 	error: req.flash('error').toString()
			// });
		});
	});
};

exports.post = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/' + currentUser.name);
	});
};

exports.reg = function(req, res) {

	
	var locals = new Locals(req);
	locals.addObj({
		title: '用户注册',
	});

	res.render('reg', locals);

	// res.render('reg', {
	// 	title: '用户注册',
	// 	user: req.session.user,
	// 	success: req.flash('success').toString(),
	// 	error: req.flash('error').toString()
	// });
};

exports.doReg = function(req, res) {
	var name = req.body.username,
		password = req.body.password,
		password_re = req.body['password-repeat'];

	// 检验用户两次输入的口令是否一致
	if (password_re != password) {
		req.flash('error', '两次输入的口令不一致');
		console.log("密码不一致！");
		return res.redirect('/reg');
	}

	// 生成口令的散列值
	var md5 = crypto.createHash('md5');
	password = md5.update(req.body.password).digest('base64');


	var newUser = new User({
		name: name,
		password: password
	});

	// 检查用户名是否已经存在
	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'Username already exists.'
		}

		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}

		// 如果用户名不存在则新增用户
		newUser.save(function(err) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
};

exports.login = function(req, res) {

	var locals = new Locals(req);
	locals.addObj({
		title: '用户登录',
	});

	res.render('login', locals);

	// res.render('login', {
	// 	title: '用户登录',
	// 	user: req.session.user,
	// 	success: req.flash('success').toString(),
	// 	error: req.flash('error').toString()
	// });
};

exports.doLogin = function(req, res) {
	// 生成用户口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户密码错误');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
};