var router = require('express').Router();

var Service = require('model/service.model');

router.get('/:id', function(req, res, next) {

	Service.findOne({ '_id': req.params.id }, function(err, result){
		if(err) return next(err);
		res.json(result);
	});
	
});

module.exports = router;