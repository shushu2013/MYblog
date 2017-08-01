var Post = require('../models/post');
var Article = require('../models/article');
var ObjectID = require('mongodb').ObjectID;

exports.dosay = function(req, res) {
	var username = req.query.username;
	var id = req.query.id;
	var flag = req.query.flag;

	Post.update(username, ObjectID(id), flag, function(err) {
		if (err) {
			res.status(400).send({err: err});
		} else {
			res.status(200).send({suc:'success!'});
		}
	});
};