var router = require('express').Router();

var TemplateWorkflow 	= require('model/TemplateWorkflow');
var WorkflowTask	 	= require('model/WorkflowTask.model');
var WorkflowExecution 	= require('model/WorkflowExecution.model');

router.get('/templateworkflows', function(req, res, next) {

	TemplateWorkflow.find({}, function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	});
	
});

router.get('/tasks', function(req, res, next){
	WorkflowTask.find({}, function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	})
});

router.get('/workflowexecutions', function(req, res, next){
	WorkflowTask.find({}, function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	})
});

module.exports = router;