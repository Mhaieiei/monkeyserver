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

	var query = {};
	var conditions = [];

	if(req.query.name){
		conditions.push( { "templateName": { "$regex": req.query.name, "$options": "i" } } );
	}

	/*if(req.query.author){
		if( status != null ){
			conditions.push( { "executor": status } );
		}
	}*/

	if( conditions.length >= 1 ){
		query = { $and: conditions };
	}


	WorkflowTask.find(query,  '-details', function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	});
});

router.get('/workflowexecutions', function(req, res, next){

	var query = {};
	var conditions = [];

	if(req.query.name){
		conditions.push( { "templateName": { "$regex": req.query.name, "$options": "i" } } );
	}

	if(req.query.status){
		var status = null;
		if( req.query.status === 'inprogress' ){
			status = 0;
		} else if( req.query.status === 'done' ){
			status = 1;
		}
		if( status != null ){
			conditions.push( { "status": status } );
		}
	}

	if( conditions.length >= 1 ){
		query = { $and: conditions };
	}

	WorkflowExecution.find(query, '-details -handlers -variables', function(err, result){
		if(err) return res.json({ message : 'error' });
		res.json(result);
	})
});

module.exports = router;