var express 			= require('express');
var router  			= express.Router();
var Form				= require('../../model/form.model');

router.get('/create', function(req, res){
	res.render('wf/form/create',  { layout: 'homePage' } );
});

router.get('/new', function(req, res){
	res.render('wf/form/new',  { 
		layout: 'homePage',
		name: '',
		description: '',
		elements: JSON.stringify([]) 
	});
});

router.get('/:id/edit', function(req, res){
	
	Form.findOne({ _id: req.params.id }, function(err, form){
		res.render('wf/form/new', { 
			layout: 'homePage',
			name: form.name,
			description: form.description,
			elements: JSON.stringify( form.elements )
		});
	});

});

router.post('/same', function(req, res){
	console.log( req.body );
	res.end("XXX");
});

router.post('/:id/update', function(req, res){
	
	Form.update( { '_id': req.params.id },
		{
			name: req.body.name,
			description: req.body.description,
			elements: req.body.elements
		},
		function(err){
			if(err) res.end("FAILED");
			else res.end("succesful");
		}
	);

});

router.post('/new', function(req, res){

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