var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/TemplateWorkflow');
var WorkflowExecution	= require('../model/WorkflowExecution.model');
var WorkflowHandler		= require('./WorkflowHandler');
var parseString 		= require('xml2js').parseString;
var runner				= require('./runner');
var workflowRunner		= require('./workflowRunner');
var Promise				= require('bluebird');


router.get('/test', function(req, res){
	
});

router.get('/', function(req, res){
	
	TemplateWorkflow.find({}, function(err, result){
		if(err) console.log(err);

		res.render('wf/execute', { layout: "homePage",workflows : result } );

	});
});

router.get('/create', function(req, res){
	res.render('wf/create.hbs', { layout:"workflowMain" } );
});

router.post('/save', function(req, res){

	var tpWorkflow = new TemplateWorkflow( { 
		name: req.body.name, 
		description: req.body.description,
		xml: req.body.xml,
		elements: req.body.elements
	});
	
	tpWorkflow.save(function (err) {
		if(!err){
			console.log('Save template workflow !!!');
			res.end('succesful');
		}
		else{
			console.log(err);
			res.end('failed');
		}
	});
});

router.get('/:id/profile', function(req, res){
		
	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

	res.render('wf/single/profile.hbs', 
		{ layout:"workflowMain",workflow: result } );
	});	

});


router.get('/:id/execute', function(req, res){

	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

		var xml = result.xml;

		parseString(xml, function(er, strResult){

			var elements = strResult["bpmn2:definitions"]["bpmn2:process"][0];

			var handler = new WorkflowHandler();

			handler.magic( elements );

			var execution = new WorkflowExecution({
				templateId: result.id,
				runningElements: handler.currentElements,
				waitingElements: [],
				variables: result.variables,
				details: result.elements,
				handlers: handler.elements
			});

			execution.save(function (err) {
				if(!err){
					console.log('Execution success');
					workflowRunner.run(execution, res);
				}
				else{
					console.log(err);
					res.end('failed');
				}
			});

		});
	});

});


router.post('/:id/execute', function(req, res){
	res.end("DONE");
});

module.exports = router;