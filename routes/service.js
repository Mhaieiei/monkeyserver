var express 			= require('express');
var router  			= express.Router();
var Service				= require('../models/service.model');


router.get('/all', function(req, res){

	Service.find({}, function(err, result){

		if(err) console.log(err);
		res.json(result);
	});

});

router.get('/create', function(req, res){
	res.render('service/create');
});

module.exports = router;