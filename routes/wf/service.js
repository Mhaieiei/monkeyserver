var express 			= require('express');
var router  			= express.Router();
var Service				= require('../../model/service.model');

router.get('/all', function(req, res){

	Service.find({}, function(err, result){

		if(err) console.log(err);
		res.json(result);
	});

});

router.get('/create', function(req, res){
	res.render('wf/service/create', { layout: 'homePage' } );
});

router.post('/create', function(req, res){
	var service = new Service({
		name: req.body.name,
		description: req.body.description,
		inputs: req.body.inputs,
		outputs: req.body.outputs,
		script: req.body.script
	});

	service.save(function (err) {
		if(!err){
			console.log('Save service !!!');
			res.end('succesful');
		}
		else{
			console.log(err);
			res.end('failed');
		}

	});
});

module.exports = router;