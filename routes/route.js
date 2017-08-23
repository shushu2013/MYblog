var crypto = require('crypto');
var fs = require('fs');
var User = require('../models/user');
var Post = require('../models/post');
var Article = require('../models/article');
var Locals = require('./locals');
var ObjectID = require('mongodb').ObjectID;

// 处理 微言 首页
exports.index = function(req, res) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}

		Article.get(null, function(err, articles) {
			if (err) {
				articles = [];
			}

			var locals = new Locals(req);

			locals.addObj({
				title: '首页',
				posts: posts,
				articles: articles,
				pageTestScript: '/test/pgtest/tests-index.js'
			});

			if (locals.user) {
				User.get(locals.user.name, function(err, user) {
					if (err) {
						return;
					}
					locals.user = user;
					res.render('index', locals);
				});
			} else {
				res.render('index', locals);
			}

		});
	});
};

// 处理微言页面 /micro-say
exports.microsay = function(req, res) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}

		var locals = new Locals(req);
		locals.addObj({
			title: '微言',
			posts: posts,
		});

		if (locals.user) {
			User.get(locals.user.name, function(err, user) {
				if (err) {
					return;
				}
				locals.user = user;
				res.render('microsay', locals);
			});
		} else {
			res.render('microsay', locals);
		}
	});
};

// 处理微文页面 /micro-essay
exports.microessay = function(req, res) {
	Article.get(null, function(err, articles) {
		if (err) {
			articles = [];
		}

		var locals = new Locals(req);
		locals.addObj({
			title: '微文',
			articles: articles,
		});

		if (locals.user) {
			User.get(locals.user.name, function(err, user) {
				if (err) {
					return;
				}
				locals.user = user;
				res.render('microessay', locals);
			});
		} else {
			res.render('microessay', locals);
		}

	});
};

// 处理个人主页 /u/:user
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

			Article.get(user.name, function(err, articles) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}

				var locals = new Locals(req);
				locals.addObj({
					title: user.name,
					user: user,
					posts: posts,
					articles: articles,
				});

				res.render('user', locals);
				
			});
		});
	});
};

// 处理个人文章 /u/:user/essay/:id
exports.essay = function(req, res) {
	var username = req.params.user;
	var id = ObjectID(req.params.id);

	// 先查找用户是否存在
	User.get(username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}

		Article.getOnly(username, id, function(err, article) {
			if (err) {
				article = {};
			}


			var locals = new Locals(req);
			locals.addObj({
				title: article.title,
				user:user,
				article: article,
				url: null
			});
			
			if (article.essayid || article.essayid === 0) {

				Article.getPreNextLink(article.essayid, function(err, url){
					locals.addObj({
						url: url
					});
					res.render('useressay', locals);
				});
			} else {
				res.render('useressay', locals);
			}

		});

	});
	
};

// 处理个人介绍 /u/:user/about
exports.about = function(req, res) {
	var username = req.params.user;

	User.get(username, function(err, user) {
		if (!user) {
			return res.redirect('/404');
		}
		res.render('about');
	});
};

// 处理个人设置 /u/:user/setting
exports.setting = function(req, res) {
	var username = req.params.user;

	User.get(username, function(err, user) {
		if(!user) {
			return res.redirect('/404');
		}

		var locals = new Locals(req);
		locals.addObj({
			title: '设置',
			user: user
		});

		if (locals.user) {
			User.get(locals.user.name, function(err, user) {
				if (err) {
					return;
				}

				locals.user = user;
				res.render('setting', locals);
			});
		} else {
			res.render('setting', locals);
		}
		
	});
};

exports.dosetting = function(req, res) {
	var username = req.params.user;
	var img = req.body.img;
	var motto = req.body.motto || null;
	var desc = req.body.desc || null;
	var newUser;

	User.get(username, function(err, user){
		if(!user) {
			return res.redirect('/404');
		}

		if (img) {
			var buffer = img.replace(/^data:image\/\w+;base64,/, '');
			var imgBuffer;

			buffer = buffer && buffer.replace(/\s/g,'+');
			imgBuffer = new Buffer(buffer, 'base64');

			fs.writeFile('./public/avatar/'+ username +'.png', imgBuffer, function(err) {
				if(err) {
					res.status(400).send({err:err});
				} else {
					user.imgurl = '/avatar/'+user.name+'.png';
					user.motto = motto;
					user.desc = desc;
					newUser = new User(user);
					newUser.update(function(err) {
						if(err) {
							res.status(400).send({err: err});
						}
						
						res.status(200).send({imgurl: user.imgurl});
					});
				}
			});	
		} else {
			user.motto = motto;
			user.desc = desc;
			newUser = new User(user);
			newUser.update(function(err) {
				if(err) {
					res.status(200).send({err: err});
				}
				res.status(200).send({suc: 'Success!'});
			});
		}
	});
};


// 处理发表微言 /post
exports.post = function(req, res) {
	var currentUser = req.session.user;
	var text = req.body.post;

	// 判断微言是否合格
	if(!text) {
		req.flash('error', '微言内容不能为空！');
		return res.redirect('/');
	}
	var post = new Post(currentUser.name, text);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/');
	});
};

// 处理发表文章页面 /article
exports.article = function(req, res) {
	var locals = new Locals(req);
	locals.addObj({
		title: '发表文章',
	});

	res.render('article', locals);
};

exports.doarticle = function(req, res) {
	var title = req.body.title,
		text = req.body['editormd-markdown-doc'],
		html = req.body['editormd-html-code'];

	// 判断文章是否合格
	if(!title || !text) {
		req.flash('error', '文章标题或内容不能为空！');

		return res.redirect('/');
	}

	var currentUser = req.session.user;
	var article = new Article(currentUser.name, title, text, html);
	article.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/');
	});

};

// 处理注册页面 /reg
exports.reg = function(req, res) {

	
	var locals = new Locals(req);
	locals.addObj({
		title: '用户注册',
	});

	res.render('reg', locals);

};

exports.doReg = function(req, res) {
	var name = req.body.username,
		password = req.body.password,
		password_re = req.body['password-repeat'];

	var flag = name && password && password === password_re;
	var errorMsg = "";
	if(!flag) {

		// 检验用户两次输入的口令是否一致
		if (name && password) {
			errorMsg = password_re ? '两次输入的密码不一致！' : '请再次输入密码！' ;
		} else {
			errorMsg = '用户名或密码不能为空！';
		}

		req.flash('error', errorMsg);
		console.log(errorMsg);
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
			err = user.name + ' 用户名已存在！';
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

// 处理登录页面 /login
exports.login = function(req, res) {

	var locals = new Locals(req);
	locals.addObj({
		title: '用户登录',
	});

	res.render('login', locals);
};

exports.doLogin = function(req, res) {
	// 生成用户口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在!');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户密码错误!');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
};


// 处理登出
exports.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
};