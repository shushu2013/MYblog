
var routes = require('./route');
var dojxs = require('./dojx');

module.exports = function(app) {
	//首页
	app.get('/', routes.index);
	app.get('/index', routes.index);
	// 微言页面
	app.get('/micro\-say', routes.microsay);
	// 微言点赞数记录
	app.get('/domicrosay', dojxs.dosay);

	// 微文页面
	app.get('/micro\-essay', routes.microessay);
	// 微文点赞数记录
	app.get('/domicroessay', dojxs.doessay);

	// 个人主页
	app.get('/u/:user', routes.user);
	// 个人文章
	app.get('/u/:user/essay/:id', routes.essay);

	// 个人主页文章分页
	app.get('/u/:user/page/:number', dojxs.dopage);
	// 个人介绍
	app.get('/u/:user/about', routes.about);
	// 个人设置
	app.get('/u/:user/setting', checkLogin);
	app.get('/u/:user/setting', routes.setting);
	app.post('/u/:user/setting', checkLogin);
	app.post('/u/:user/setting', routes.dosetting);
	
	// 发表微言
	app.post('/post', checkLogin);
	app.post('/post', routes.post);

	// 发表文章页面
	app.get('/article', checkLogin);
	app.get('/article', routes.article);
	app.post('/article', checkLogin);
	app.post('/article', routes.doarticle);

	// 注册
	app.get('/reg', checkNotLogin);
	app.get('/reg', routes.reg);
	app.post('/reg', checkNotLogin);
	app.post('/reg', routes.doReg);

	// 登录
	app.get('/login', checkNotLogin);
	app.get('/login', routes.login);
	app.post('/login', checkNotLogin);
	app.post('/login', routes.doLogin);

	// 登出
	app.get('/logout', checkLogin);
	app.get('/logout', routes.logout);
};

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}