var express 	= require('express');
var router  	= express.Router();
var multer  	= require('multer');
var upload 		= multer({ dest: 'uploads/' });
var request		= require('request');


router.get('/upload', function(req, res){
	res.render('wf/upload',  { layout: 'homePage' } );
});

router.post('/upload', upload.single('file_source'), function(req, res){
	console.log( req.body );
	console.log( req.file );
	var baseUrl = req.protocol + '://' + req.get('host');
    request.post({url: baseUrl + '/some/testapi', form: { 'ice' :'yoyo'} },
    function(error1,response1,body1){
    	if( error1) console.log("ERRR");
    	res.end('xxx');
    });
});

router.post('/testapi', function(req, res){

	console.log( req.body );
	res.end('END');
});



module.exports = router;