var express 			= require('express');
var router  			= express.Router();
var Form				= require('../../model/form.model');

router.get('/create', function(req, res){
	res.render('wf/form/create',  { layout: 'homePage' } );
});

router.get('/new', function(req, res){
	res.render('wf/form/new', { layout: 'homePage' } );
});

router.post('/create', function(req, res){

	var form = new Form({
		name: req.body.name,
		description: req.body.description,
		elements: req.body.elements
	});

	form.save(function(err){
		if(err){ res.end('failed'); }
		else{
			res.end('successful');
		}
	});
});

router.get('/all', function(req, res){

	Form.find({}, function(err, result){

		if(err) console.log(err);
		console.log( "Form: " + result );

		res.json(result);
	});

});

module.exports = router;