var router = require('express').Router();

var TemplateWorkflow 	= require('model/TemplateWorkflow');
var WorkflowTask	 	= require('model/WorkflowTask.model');
var WorkflowExecution 	= require('model/WorkflowExecution.model');
var SimpleRole			= require('model/simpleRole');

router.get('/templateworkflows', function(req, res) {

	TemplateWorkflow.find({}, function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	});
	
});

router.get('/simpleroles', function(req, res){
	SimpleRole.find({}, function(err, result){
		if(err) return res.json({ message : 'error' });
		else{
			res.json(result);
		}
	})
});


router.get('/tasks', function(req, res, next){
	WorkflowTask.find({},  '-details', function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	})
});

router.get('/workflowexecutions', function(req, res, next){
	WorkflowExecution.find({}, '-details -handlers -variables', function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	})
});

module.exports = router;