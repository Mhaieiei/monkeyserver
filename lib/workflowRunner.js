var WorkflowExecution	= require('../model/WorkflowExecution.model');
var Service 			= require('../model/service.model');
var Form				= require('../model/form.model');
var WorkflowTask		= require('../model/WorkflowTask.model');
var elementRunner 		= require('./elementRunner');
var request				= require('request');
var async				= require('async');

module.exports ={
	'run': run
}

function run( execution, res ){

	var runningElements = execution.runningElements;

	mainLoop(runningElements, execution, function(err){

		if(err){
			console.log(err);
			res.end("error");
		}

		WorkflowExecution.update( 
			{ '_id': execution._id } ,		
			{ 	
				'runningElements': execution.runningElements, 
				'waitingElements': execution.waitingElements,
				'details': execution.details,
				'handlers': execution.handlers,
				'variables': execution.variables,
				'toDocs': execution.toDocs,
				'status': execution.status
			},		
			function(err){

				if(!err){
					if( execution.status === 1){
						createDocs(execution, res);
					}
					else{
						res.redirect('/home');
					}

				}
				else{
					console.log(err);
					res.redirect('/home');
				}
			}
		);

	});

}

function createDocs(execution, res){

	var toDocs = execution.toDocs;
	
	var baseUrl = req.protocol + '://' + req.get('host');
	// var baseUrl = 'http://localhost:5000';

	async.each(toDocs, function(doc, callback) {

		var formId = doc.taskResult.details.form.id;
		
		var files = doc.submitResult.files;
		var fileKeys = Object.keys(files);
		var attachment = [];

		for(var i = 0; i < fileKeys.length; i++){
			var baseDirectory = 'uploads/document/';
			var filename = String(files[ fileKeys[i] ].path).split('/');
			var aFile = {};
			aFile.displayName = files[ fileKeys[i] ].name;
			aFile.executionId = String(execution._id);
			aFile.filepath = baseDirectory + filename[ filename.length - 1 ];
			attachment.push(aFile);
		}

		Form.findOne({_id: formId}, function(err, formResult){
			
			var bodyData = {
					recipient: doc.taskResult.doerId,
					form: {
						displayName: formResult.name + '_' + doc.taskResult._id, 
						executionId: String(execution._id),
						HTMLContent: getHtmlContent( formResult, doc.submitResult )
					},
					attachment: attachment
				};

			console.log(bodyData);

			request.post({
				url: baseUrl + '/api/document/upload', 
				form: bodyData
			},
			function(err, response, body){
				if(err)
					console.error(err);
				callback();
			});

		});

	}, function(err){
		res.redirect('/home');
	});

}


function mainLoop(runningElements, execution, callback){
	if( runningElements.length > 0 ){
		var elementId = runningElements.splice(0,1)[0];
		doElement(elementId, execution)
		.then(postAction)
		.then(function(){
			mainLoop(runningElements, execution, callback);
		})
		.catch(function(error){
			callback(error);
		});
	}
	else{
		callback(null);
	}
}


function doElement( elementId, execution ){
	return new Promise(function(resolve, reject){
		var thisElement = execution.handlers[elementId];
		var action = elementRunner[thisElement.type];

		console.log("DO Element");
		action( elementId, execution )
		.then(function(){
			var data = {}
			data.elementId = elementId;
			data.execution = execution;
			resolve(data);
		})
		.catch(function(err){
			reject(err);
		});
	});
	
}

function postAction( data ){
	return new Promise(function(resolve, reject){
		var elementId = data.elementId;
		var execution = data.execution;

		console.log("POST ACTION");
		var thisElement = execution.handlers[elementId];

		console.log("status = " + thisElement.status );

		if( thisElement.status === 'done' ){
			
			var nextElements = [];	

			if( thisElement['bpmn2:outgoing'] != undefined ){
				nextElements = thisElement['bpmn2:outgoing'];
			}

			for( var i = 0; i < nextElements.length; i++ ){
				execution.runningElements.push( nextElements[i] );	
			}
			resolve();
		}
		else if( thisElement.status === 'pass' ){
			execution.runningElements.push( thisElement['targetRef'] );
			resolve();
		}
		else if( thisElement.status === 'wait' ){
			execution.waitingElements.push( elementId );

			var laneDetail = execution.details[ thisElement['laneRef'] ];
			var laneHandler = execution.handlers[ thisElement['laneRef'] ];

			var doerId = 'none';
			var roleId = 'none';

			if( laneHandler.doerId != undefined ){
				doerId = laneHandler.doerId;
			}
			else if( laneDetail.role != undefined ){
				roleId = laneDetail.role.id;
			}

			console.log( "DOER ID " + doerId );
			console.log( "ROLE ID " + roleId );
			
			var workflowTask = new WorkflowTask({
				workflowExecutionId: execution._id,
				templateName: execution.templateName,
				taskName: elementId,
				elementId: elementId,
				doerId: doerId,
				roleId: roleId,
				details: execution.details[elementId]
			});

			workflowTask.save(function(err){
				if(err) console.log(err);
				resolve();
			});
		}
		else{
			resolve();
		}

	});
}

function getHtmlContent( form, submitResult ){

	var formElements = form.elements;

	var formHtml = '<h1>'+ form.name +'</h1>';
	formHtml += '<h3>' + form.description + '</h3>';

	for(var i = 0; i < formElements.length; i++){
		formHtml += '<div>' + getHtmlElement( formElements[i], submitResult ) + '</div>';
	}
	
	return formHtml;
}


function getHtmlElement( element, inputResults ){

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



