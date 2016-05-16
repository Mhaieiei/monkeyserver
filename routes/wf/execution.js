var express 			= require('express');
var router  			= express.Router();
var WorkflowExecution 	= require('../../model/WorkflowExecution.model');
var WorkflowTask		= require('../../model/WorkflowTask.model');
var TemplateWorkflow	= require('../../model/TemplateWorkflow');
var workflowRunner		= require('../../lib/workflowRunner');
var Form				= require('../../model/form.model');

router.get('/', function(req, res){

	WorkflowExecution.find({ 'executorId': 	req.user._id }, function(err, result){
		if(err) console.log(err);
		console.log( result );
		res.render('wf/execution/all', { layout: 'homePage', result: result} );
	});

});

router.get('/tasks', function(req, res){
	console.log( "SIMPLE ROLE: " + req.user.simpleRole );
	WorkflowTask.find( { $or: [ {'doerId': req.user._id }, { 'roleId': req.user.simpleRole } ] }, 
	function(err, result){
		if(err) console.log(err);
		res.render('wf/task/all', { layout: 'homePage', result: result });
	});
});

router.get('/tasks/:id', function(req, res){
	WorkflowTask.findOne({ '_id': req.params.id }, function(err, taskResult){
		if(err) console.log(err);

		if( taskResult.details.form != undefined ){
			
			Form.findOne({ '_id': taskResult.details.form.id }, function(err, formResult){
				
				console.log(formResult);
				var inputResults = {};
				if( taskResult.details.inputResults != undefined ){
					inputResults = taskResult.details.inputResults;
				}
				var elements = [];
				if( formResult.elements !== null ) {
					elements = formResult.elements;
				}
				

				var formHtml = '<form method="post" action="/execution/tasks/' + taskResult._id + '">';
		
				for(var i = 0; i < elements.length; i++){
					formHtml += '<div>' + getHtmlElement( elements[i], inputResults ) + '</div>';
				}
				
				formHtml += '<input type="submit" name="submit" value="Submit">';

				res.render('wf/task/one', { layout: 'homePage', html: formHtml });
			});
		}
		else{
			res.end('not found');
		}

		
	});

});

router.post('/tasks/:id', function(req, res){

	WorkflowTask.findOne({'_id': req.params.id }, function(err, taskResult){
		
		var executionId = taskResult.workflowExecutionId;
		var elementId = taskResult.elementId;

		WorkflowExecution.findOne({'_id': executionId }, function(err, execution){
			var newDetails = execution.details;
			var thisElement = execution.handlers[elementId];
			var laneHandler = execution.handlers[ thisElement['laneRef'] ];

			newDetails[taskResult.elementId].submitResults = req.body;
			laneHandler.doerId = req.user._id;

			execution.runningElements.push( taskResult.elementId );

			WorkflowTask.remove({ '_id': taskResult._id }, function(err){
				workflowRunner.run(execution, res);
			});
			
		});
		
	});

});

router.get('/:id', function(req, res, next){

	WorkflowExecution.findOne( { "_id" : req.params.id }, function(err, execution){

		if(err) return next(err);

		TemplateWorkflow.findOne( { "_id": execution.templateId }, function(err, template){
			if(err) return next(err);

			var data = {};
			data.name = template.name;
			data.status = execution.status || 0;

			res.render('wf/execution/one', { layout: 'homePage', data: data });
		});
	});

});

router.post('/:id', function(req, res){

	// deal with output mapping
	WorkflowExecution.findOne( { "_id" : req.params.id }, function(err, execution){

		runner.mapOutput(execution, req.body);

		execution.handler.currentTask = execution.handler.currentTask.next;
		
		WorkflowExecution.update({ _id: execution._id },
			{ 'variables': execution.variables, 'handler': execution.handler },
			
			function(err){
				if(err) console.log('error');
				else console.log('update succesful');

				runner.runWorkflow(execution, res);
			}
		);
	});

});

function getHtmlElement( element, inputResults ){

	var html = "";

	if( inputResults[element.name] != undefined ){
		element.value = inputResults[element.name];
	}

	if( element.type === "label" ){
		html += "<b>" + element.value + "</b>";
	}
	else if( element.type ==="textbox" ){
		html += '<input type="text" name="' + element.name + '">';
	}

	return html;
}

function executeTask(id){
	WorkflowExecution.findOne( { "_id" : id }, function(err, execution){

		var currentTask = execution.elements[execution.handler.currentTask.id]
		var wfVariables = execution.variables;
		var inputMappings = currentTask.inputMappings;

		if( inputMappings !== undefined ){
			for(var i = 0; i < inputMappings.length; i++ ){
				for(var j = 0; j < wfVariables.length; j++){
					if( inputMappings[i].second === wfVariables[j].name ){
						inputMappings[i].value = wfVariables[j].value;
					}
				}
			}
		}

		var thisElement = "elements." + execution.handler.currentTask.id + ".inputMappings";
		console.log(thisElement);
		WorkflowExecution.update({ _id: execution._id}, 
		{ thisElement : inputMappings }, 
		function(err){
			
			if(!err) {
				console.log('succesful update');
			}
			else{
				console.log('error');
			}
	
			
		});
		

	});
}


function mapping(){

}

function executeWorkflow(execution, res){
	console.log('execute workflow');

	var currentElement = execution.handler.currentTask;

	while( currentElement !== null ){

		//console.log( currentElement.toString() );
		if( currentElement.type === "user" ){
			 execution.handler.currentTask = currentElement;
			 break;
		}

		currentElement = currentElement.next;
	}
	

	WorkflowExecution.update({ _id: execution._id}, 
		{ 'handler.currentTask': currentElement }, 
		function(err){
			
			if(!err) {
				console.log('succesful update');
			}
			else{
				console.log('error');
			}
			res.redirect('/');
		});


}



module.exports = router;