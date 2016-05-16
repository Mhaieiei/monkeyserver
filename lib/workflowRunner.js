var WorkflowExecution	= require('../model/WorkflowExecution.model');
var Service 			= require('../model/service.model');
var Form				= require('../model/form.model');
var WorkflowTask		= require('../model/WorkflowTask.model');
var elementRunner 		= require('./elementRunner');

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
				'variables': execution.variables
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

function something(){
	return new Promise(function(resolve){
		console.log("something");
	});
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


