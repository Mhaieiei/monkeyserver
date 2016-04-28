var WorkflowExecution	= require('../model/WorkflowExecution.model');
var Service 			= require('../model/service.model');
var Form				= require('../model/form.model');
var WorkflowTask		= require('../model/WorkflowTask.model');
var elementRunner 		= require('./elementRunner');

module.exports = {
	'run': run
}

function run( execution, res ){

	var runningElements = execution.runningElements;

	mainLoop(runningElements, execution, function(){

		WorkflowExecution.update( 
			{ '_id': execution._id } ,		
			{ 	
				'runningElements': execution.runningElements, 
				'waitingElements': execution.waitingElements,
				'details': execution.details,
				'handlers': execution.handlers
			},		
			function(err){

				if(!err){
					console.log('success');
					res.end('success');
				}
				else{
					console.log('failed');
					console.log(err);
					res.end('failed');
				}
			}
		);

	});

}


function mainLoop(runningElements, execution, callback){

	if( runningElements.length > 0 ){
		var elementId = runningElements.splice(0,1)[0];
		doElement(elementId, execution)
		.then(postAction(elementId, execution))
		.then(function(){
			mainLoop(runningElements, execution, callback);
		});

	}
	else{
		callback();
	}
	
}


function doElement( elementId, execution ){
	return new Promise(function(resolve){
		var thisElement = execution.handlers[elementId];
		var action = elementRunner[thisElement.type];

		action( elementId, execution )
		.then(function(){
			resolve();
		});
	});
}

function postAction( elementId, execution ){
	return new Promise(function(resolve){

		var thisElement = execution.handlers[elementId];

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
		else if( thisElement.status === 'waiting' ){
			execution.waitingElements.push( elementId );
			
			var workflowTask = new WorkflowTask({
				workflowExecutionId: execution._id,
				elementId: elementId,
				details: execution.details[elementId]
			});

			workflowTask.save(function(err){
				if(err) console.log(err);
				resolve();
			});
		}

	});
}


