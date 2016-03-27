var express 			= require('express');
var router  			= express.Router();
//var Form				= require('../models/form.model');

router.get('/create', function(req, res){
	res.render('wf/form/create');
});

router.post('/create', function(req, res){
	res.redirect('wf/form/create');
});

router.get('/all', function(req, res){

	Form.find({}, function(err, result){

		if(err) console.log(err);
		console.log( "Form: " + result );

		res.json(result);
	});

});

module.exports = router;