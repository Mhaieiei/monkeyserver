var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../../model/TemplateWorkflow');
var WorkflowExecution	= require('../../model/WorkflowExecution.model');
var SimpleRole			= require('../../model/simpleRole');
var WorkflowHandler		= require('../../lib/WorkflowHandler');
var parseString 		= require('xml2js').parseString;
var workflowRunner		= require('../../lib/workflowRunner');


router.get('/', function(req, res){

	if( req.user.local.username === 'admin' ){

		TemplateWorkflow.find({}, function(err, tpWf){
			res.render('wf/template_admin', { 
				layout: "homePage", 
				workflows : tpWf,
				username: req.user.local.username,
				admin: true
			});
		});

	}
	else{

		TemplateWorkflow.find({ 'simpleRoleId': req.user.simpleRole }, function(err, tpWf){
			res.render('wf/template', { 
				layout: "homePage", 
				workflows : tpWf,
				username: req.user.local.username,
				admin: false
			});
		});
	}

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

	var xml = req.body.xml;

	parseString(xml, function(err, strResult){

		var collaboration = strResult["bpmn2:definitions"]["bpmn2:collaboration"];
		var process = strResult["bpmn2:definitions"]["bpmn2:process"];

		var handler = new WorkflowHandler();
		var startLaneId = handler.getStartLaneId(process, collaboration);

		var simpleRoleId = req.body.elements[startLaneId].role.id;
			
		var tpWorkflow = new TemplateWorkflow({ 
			name: req.body.name, 
			description: req.body.description,
			xml: req.body.xml,
			variables: req.body.variables,
			elements: req.body.elements,
			simpleRoleId: simpleRoleId
		});

		tpWorkflow.save(function(err){
			if(!err){
				res.end('succesful');
			}
			else{
				res.end('failed');
			}
		});
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

	var xml = req.body.xml;

	parseString(xml, function(err, strResult){

		var collaboration = strResult["bpmn2:definitions"]["bpmn2:collaboration"];
		var process = strResult["bpmn2:definitions"]["bpmn2:process"];

		var handler = new WorkflowHandler();
		var startLaneId = handler.getStartLaneId(process, collaboration);

		var simpleRoleId = req.body.elements[startLaneId].role.id;

		TemplateWorkflow.update( { '_id': req.params.id },
			{
				name: req.body.name, 
				description: req.body.description,
				xml: req.body.xml,
				variables: req.body.variables,
				elements: req.body.elements,
				simpleRoleId: simpleRoleId
			},
			function(err){
				if(err) res.end("FAILED");
				else res.end("succesful");
			}
		);
	});

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

			var execution = new WorkflowExecution({
				templateId: result.id,
				templateName: result.name,
				executorId: req.user._id,
				runningElements: handler.currentElements,
				waitingElements: [],
				variables: result.variables,
				details: result.elements,
				handlers: handler.elements,
				toDocs: [],
				status: 0
			});

			execution.save(function (err) {
				if(!err){
					console.log('Execution success');
					workflowRunner.run(execution, res);
				}
				else{
					console.log(err);
					return next(err);
				}
			});

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