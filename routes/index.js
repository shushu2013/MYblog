
var routes = require('./route');

module.exports = function(app) {
	app.get('/', routes.index);
	app.get('/index', routes.index);
	app.get('/u/:user', routes.user);

	app.post('/post', checkLogin);
	app.post('/post', routes.post);

	app.get('/reg', checkNotLogin);
	app.get('/reg', routes.reg);
	app.post('/reg', checkNotLogin);
	app.post('/reg', routes.doReg);

	app.get('/login', checkNotLogin);
	app.get('/login', routes.login);
	app.post('/login', checkNotLogin);
	app.post('/login', routes.doLogin);

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