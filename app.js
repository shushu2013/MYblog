var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var logger = require('morgan');
var fs = require('fs');

var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname , 'public')));
app.use(session({
	secret: settings.cookieSecret,
	key: settings.db, //cookie name
	cookie: {maxAge: 1000*60*60*24*30}, // 30days
	saveUninitialized: false, // don't create session until something stored 
    resave: false, //don't save session if unmodified 
	store: new MongoStore({
		url: "mongodb://localhost/microblog",
		db: settings.db,
		host: settings.host,
		port: settings.port
	})
}));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// logger
app.use(logger('combined',{stream: accessLog}));
app.use(function(err, req, res, next) {
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
	next();
});

// Test
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') != 'production' &&
		req.query.test === '1';
	next();
});

// Routes
routes(app);

// 404 
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

// 在外部模块调用app.js时，禁用服务器自动启动
if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port 3000");
}
