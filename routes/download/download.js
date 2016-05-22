var express = require('express');
var path = require('path');
var router = express.Router();
var Document = require('model/document/document');

router.get('/document/:file', function(req, res) {
	downloadFile(res, 'uploads/document/' + req.params.file);
});

router.get('/document/form/:file', function(req, res) {
	downloadFile(res, 'uploads/document/form' + req.params.file);
});

function downloadFile(res, path2file) {
	var file = path.resolve(path2file);
	res.set('Content-Type', 'file');
	res.download(file);
}

/*
Check whether user have permission to download a file
	- User must have already logged in to the system
	- User must own that file or the file can be downloaded by any members
*/
function isGranted(req, res, next) {
	var isLogin = req.user != undefined;
	if(!isLogin)
		return res.redirect('/');

	isMyFile(req.user, req.params.file, res, next);
}

/*
Check whether user owns the destinated file
If user doesn't own the file, redirect to root
*/
function isMyFile(user, filename, res, next) {

	var query = Document.findOne({
		'owner': user,
		'name': filename
	});

	query.exec(function(err, _docs) {
		if(err) {
			var err = new Error(err);
			err.status = 500;
			return next(err);
		}

		if(!_docs)
			res.redirect('/home');
		else
			return next();
	});
}

module.exports = router;
