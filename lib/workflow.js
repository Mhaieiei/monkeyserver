var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/TemplateWorkflow');

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

	parseString(xml, function (err, strResult) {

			var elements = strResult["bpmn2:definitions"]["bpmn2:process"][0];
			var keys = Object.keys( elements );


			var handler = new WorkflowHandler();

				
			handler.setup( elements );
			handler.run();
			
		    res.render( "workflow/single/execute.hbs", { 
		    	layout:"workflowMain",
		    	tasks : handler.taskList,
		    	id : req.params.id
		    });
		});
	});
});

router.post('/:id/execute', function(req, res){
	res.end("DONE");
});

module.exports = router;