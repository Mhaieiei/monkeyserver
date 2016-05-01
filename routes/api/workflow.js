var router = require('express').Router();

var TemplateWorkflow = require('model/TemplateWorkflow');

router.get('/templateworkflows', function(req, res, next) {

	TemplateWorkflow.find({}, function(err, result){
		if(err) return next(err);
		res.json(result);
	});
	
});

module.exports = router;