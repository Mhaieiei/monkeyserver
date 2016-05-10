var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../../model/TemplateWorkflow');
var WorkflowExecution	= require('../../model/WorkflowExecution.model');
var WorkflowHandler		= require('../../lib/WorkflowHandler');
var parseString 		= require('xml2js').parseString;
var workflowRunner		= require('../../lib/workflowRunner');
var Promise				= require('bluebird');



router.get('/', function(req, res){
	
	TemplateWorkflow.find({}, function(err, result){
		if(err) console.log(err);

		res.render('wf/execute', { layout: "homePage", workflows : result } );

	});
});



router.get('/new', function(req, res){
	res.render('wf/create', { 
		layout:"workflowMain",
		wfName: '',
		wfDescription: '',
		wfVariables: JSON.stringify([]),
		wfDetails: JSON.stringify({}),
		loadedDiagramXML: '""'
	});
});

router.post('/save', function(req, res){

	var tpWorkflow = new TemplateWorkflow( { 
		name: req.body.name, 
		description: req.body.description,
		xml: req.body.xml,
		variables: req.body.variables,
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

router.get('/:id/edit', function(req, res, next){

	TemplateWorkflow.findOne({ '_id': req.params.id }, function(err, result){

		var wfVariables = '[]';
		if( result.variables ){
			wfVariables = JSON.stringify(result.variables);
		}

		var wfDetails = '{}';
		if( result.elements ){
			wfDetails = JSON.stringify(result.elements);
		}


		res.render('wf/create', { 
			layout:"workflowMain", 
			wfName: result.name,
			wfDescription: result.description,
			wfVariables: wfVariables,
			wfDetails: wfDetails,
			loadedDiagramXML : '`' + result.xml + '`' 
		});
	});

});

router.post('/:id/update', function(req, res, next){
	TemplateWorkflow.update( { '_id': req.params.id },
		{
			name: req.body.name, 
			description: req.body.description,
			xml: req.body.xml,
			variables: req.body.variables,
			elements: req.body.elements
		},
		function(err){
			if(err) res.end("FAILED");
			else res.end("succesful");
		}
	);
});


router.get('/:id/delete', function(req, res){
	
	TemplateWorkflow.remove({'_id': req.params.id}, function(err){
		res.redirect('/workflow');
	});
});


router.get('/:id/profile', function(req, res){
		
	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

	res.render('wf/single/profile', 
		{ layout:"homePage",workflow: result } );

	});	
});


router.get('/:id/execute', function(req, res, next){

	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

		var xml = result.xml;

		parseString(xml, function(er, strResult){

			var collaboration = strResult["bpmn2:definitions"]["bpmn2:collaboration"];
			var process = strResult["bpmn2:definitions"]["bpmn2:process"];

			var handler = new WorkflowHandler();

			handler.parse( process, collaboration );

			console.log( collaboration );
			console.log( process );

			res.end("Very Bad Programmer");

			/*var execution = new WorkflowExecution({
				templateId: result.id,
				runningElements: handler.currentElements,
				waitingElements: [],
				variables: result.variables,
				details: result.elements,
				handlers: handler.elements,
				status: 0
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
			});*/

		});
	});

});


router.post('/:id/execute', function(req, res){
	res.end("DONE");
});

router.use( function(err, req, res, next){
	return next(err);
});

module.exports = router;