var express 	= require('express');
var router  	= express.Router();
var multer  	= require('multer');
var upload 		= multer({ dest: 'uploads/' });
var request		= require('request');
var formidable  = require('formidable');
var async		= require('async');

router.get('/async', function(req, res){

	var baseUrl = req.protocol + '://' + req.get('host');
	var toDocs = ['200', '300'];

	async.each(toDocs, function(name, callback) {
		request.post({
			url: baseUrl + '/api/document/upload', 
			form: {
				recipient: 'admin',
				form: {
					displayName: name, 
					HTMLContent: '<h3>YO</h3>'
				},
				attachment: []
			}
		},
		function(err, response, body){
			callback();
		});

	}, function(err){
		res.end('xxx');
	});

});

router.get('/upload', function(req, res){
	res.render('wf/upload',  { layout: 'homePage' } );
});

router.post('/upload', function(req, res){
	
	var form = new formidable.IncomingForm();
	form.uploadDir = process.env.PWD + '/uploads';

	form.parse(req, function(err, fields, files) {

		var baseUrl = req.protocol + '://' + req.get('host');

		request.post({
			url: baseUrl + '/api/document/upload', 
			form: {
				title: 		fields.title,
				owner: 		req.user._id,
				workflowId: '573bbed4ebf6e28e1b0c5cd2',
				filepath: 	files.uploadfile.path,
				docType: 	fields.docType,
				year: 		fields.year
			}
		}, 
		function(err,httpResponse,body){
			console.log("++++++ START ++++++"); 
			console.log(body);
			console.log("++++++ END ++++++"); 
			res.end('yo');
		});
	});

});

router.post('/testapi', function(req, res){

	console.log( req.body );
	res.end('END');
});



module.exports = router;