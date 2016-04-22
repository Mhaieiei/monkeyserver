var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/TemplateWorkflow');
var WorkflowExecution	= require('../model/WorkflowExecution.model');
var WorkflowHandler		= require('./WorkflowHandler');
var parseString 		= require('xml2js').parseString;
var runner				= require('./runner');

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
		xml: req.body.xml  
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

			//console.log( handler.elements );
			//console.log( handler.currentElements );

			var execution = new WorkflowExecution({
				templateId: result.id,
				currentElements: handler.currentElements,
				variables: result.variables,
				elements: result.elements,
				handler: handler.elements
			});

			runner.magic( execution );

		
			//console.log(handler.taskList);

			res.end("XXX");

			
			/*var execution = new WorkflowExecution({
				templateId: result.id,
				currentTask: handler.startEvent.id,
				variables: result.variables,
				elements: result.elements,
				handler: handler
			});

			execution.save(function (err) {
				if(!err){
					console.log('Execution success');
					runner.runWorkflow(execution, res);
				}
				else{
					console.log(err);
					res.end('failed');
				}
			});*/
		});
	});

});


router.post('/:id/execute', function(req, res){
	res.end("DONE");
});

module.exports = router;