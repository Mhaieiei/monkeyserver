var express 			= require('express');
var router  			= express.Router();
var WorkflowExecution 	= require('../../model/WorkflowExecution.model');
var WorkflowTask		= require('../../model/WorkflowTask.model');
var TemplateWorkflow	= require('../../model/TemplateWorkflow');
var Document 			= require('../../model/document/document');
var workflowRunner		= require('../../lib/workflowRunner');
var formidable			= require('formidable');
var Form				= require('../../model/form.model');
var fs = require('fs');
var path = require('path');

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

router.get('/tasks/:id/download', function(req, res){

	WorkflowTask.findOne({ '_id': req.params.id }, function(err, taskResult){
		if(err) console.log(err);

		if( taskResult.details.form === undefined )
			return res.end('failed');
			
		Form.findOne({ '_id': taskResult.details.form.id }, function(err, formResult){
		
			var inputResults = {};
			if( taskResult.details.inputResults != undefined ){
				inputResults = taskResult.details.inputResults;
			}
			var html = getFormHtmlContent(formResult, inputResults);

			res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=form.html'});
			res.end( html );
		});
	});

});

router.get('/tasks/:id', function(req, res){
	WorkflowTask.findOne({ '_id': req.params.id }, function(err, taskResult){
		if(err) console.log(err);

		if( taskResult.details.name != undefined ){

			var formHtml = '<h1>' + taskResult.details.name + '</h1>';
			formHtml += '<form method="post" action="/execution/tasks/' + taskResult._id + '" enctype="multipart/form-data">';
			formHtml += '<input type="submit" value="Done">';
			formHtml += '</form>';

			res.render('wf/task/one', { layout: 'homePage', html: formHtml });
		}
		else if( taskResult.details.form != undefined ){
			
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
					
				var formHtml = '<h1>'+ formResult.name +'</h1>';
				formHtml += '<h3>' + formResult.description + '</h3>';
				formHtml += '<a href="/execution/tasks/' + req.params.id + '/download">Download form</a>';
				formHtml += '<form method="post" action="/execution/tasks/' + taskResult._id + '" enctype="multipart/form-data">';
		
				for(var i = 0; i < elements.length; i++){
					formHtml += '<div>' + getHtmlElement( elements[i], inputResults ) + '</div>';
				}
				
				if( formResult.type === 'approval'){
					formHtml += '<input type="submit" name="submit" value="Approve">';
					formHtml += '<input type="submit" name="submit" value="Reject">';
				}
				else{
					formHtml += '<input type="submit" name="submit" value="Submit">';
				}

				res.render('wf/task/one', { layout: 'homePage', html: formHtml });
			});
		}
		else{
			res.end('not found');
		}

		
	});
});

router.post('/tasks/:id', function(req, res ){

	WorkflowTask.findOne({'_id': req.params.id }, function(err, taskResult){
		
		if(!taskResult){
			return res.redirect('/home');
		}

		var executionId = taskResult.workflowExecutionId;
		var elementId = taskResult.elementId;

		WorkflowExecution.findOne({'_id': executionId }, function(err, execution){

			var newDetails = execution.details;
			var thisElement = execution.handlers[elementId];
			var laneHandler = execution.handlers[ thisElement['laneRef'] ];

			laneHandler.doerId = req.user._id;


			if( taskResult.details.name != undefined ){
				WorkflowTask.remove({ '_id': taskResult._id }, function(err){
					execution.runningElements.push( taskResult.elementId );
					workflowRunner.run(execution, res, req);
				});
			}
			else{

				var form = new formidable.IncomingForm();

				form.uploadDir = path.resolve('uploads/document');
				form.keepExtensions = true;

			    if(!fs.existsSync(form.uploadDir))
					fs.mkdirSync(form.uploadDir);

				form.parse(req, function(err, fields, files) {

				    newDetails[taskResult.elementId].submitResults = getSubmitResults( fields, files );

				    if( newDetails[taskResult.elementId].submitResults.submit === 'Approve' ){
				    	newDetails[taskResult.elementId].submitResults.output = '1';
				    }
				    else{
				    	newDetails[taskResult.elementId].submitResults.output = '0';
				    }

					if( newDetails[taskResult.elementId].createDoc == 1 ){
						var toDoc = {};
						toDoc.taskResult = taskResult;
						toDoc.submitResult = newDetails[taskResult.elementId].submitResults;
						execution.toDocs.push( toDoc );
					}

					WorkflowTask.remove({ '_id': taskResult._id }, function(err){
						execution.runningElements.push( taskResult.elementId );
						workflowRunner.run(execution, res, req);
					});
				});			
		    }

		});
		
	});

});

router.get('/:id', function(req, res, next){
	WorkflowExecution.findOne( { "_id" : req.params.id }, function(err, execution){

		if(err) return next(err);

		TemplateWorkflow.findOne( { "_id": execution.templateId }, function(err, template){
			if(err) return next(err);

			Document.find( { includeInWorkflow: req.params.id }, function(err, docs){
				console.log("DOCESSSS");
				console.log(docs);
				console.log("d=======");
				var data = {};
				data.name = template.name;
				data.status = execution.status || 0;
				data.documents = JSON.parse(JSON.stringify(docs));

				res.render('wf/execution/one', { layout: 'homePage', data: data });
			});
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

	var html = '<div>';
	html += '<label>' + element.label + '</label>';

	if( inputResults[element.name] != undefined ){
		element.predefinedValue = inputResults[element.name];
	}

	html += '<div>';

	if( element.type === "textarea" ){
		html += '<textarea name="' + element.name + '">' + element.predefinedValue + '</textarea>';
	}
	else if( element.type === "text" ){
		html += '<input type="text" name="' + element.name + '" value="' + element.predefinedValue +'">';
	}
	else if( element.type === "button" ){
		html += '<a href="' + element.predefinedValue + '">GO</a>';
	}
	else if( element.type === 'fileupload' ){
		html += '<input class="btn btn-sm" type="file" name="' + element.name + '">';
	}

	html += "</div></div>";

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

function getSubmitResults( fields, files ){

	var result = { files: {} };

	var fieldKeys = Object.keys( fields );
	for( var i = 0; i < fieldKeys.length; i++ ){
		result[ fieldKeys[i] ] = fields[ fieldKeys[i] ];
	}

	var fileKeys = Object.keys( files );
	for( var i = 0; i < fileKeys.length; i++ ){
		result.files[ fileKeys[i] ] = files[ fileKeys[i] ];
	}

	return result;
}


function getFormHtmlContent( form, submitResult ){

	var formElements = form.elements;

	var formHtml = '<h1>'+ form.name +'</h1>';
	formHtml += '<h3>' + form.description + '</h3>';

	for(var i = 0; i < formElements.length; i++){
		formHtml += '<div>' + getFormHtmlElement( formElements[i], submitResult ) + '</div>';
	}
	
	return formHtml;
}


function getFormHtmlElement( element, inputResults ){

	var html = '<div style="margin-top: 15px">';
	html += '<label style="font-weight: 600">' + element.label + '</label>';

	if( inputResults[element.name] != undefined ){
		element.predefinedValue = inputResults[element.name];
	}

	html += '<div>';

	if( element.type === "textarea" ){
		html += '<div>' + element.predefinedValue + '</div>';
	}
	else if( element.type === "text" ){
		html += '<div>' + element.predefinedValue +'</div>';
	}


	html += "</div></div>";

	return html;
}



module.exports = router;