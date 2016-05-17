var express 			= require('express');
var router  			= express.Router();

router.get('/upload', function(req, res){
	res.render('wf/upload',  { layout: 'homePage' } );
});

router.post('/upload', function(req, res){
	console.log( res.body );
	res.end('xxx');
});



module.exports = router;