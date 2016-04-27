var WorkflowExecution	= require('../model/WorkflowExecution.model');
var Service 			= require('../model/service.model');
var Form				= require('../model/form.model');
var elementRunner 		= require('./elementRunner');

module.exports = {
	'run': run
}

function run( execution, res ){

	var runningElements = execution.runningElements;
	
	while( runningElements.length > 0 ){
		var elementId = runningElements.splice(0,1)[0];
		console.log("==== Start Run " + elementId);
		doElement( elementId, execution );
		postAction( elementId, execution );
		console.log("==== End Run " + elementId);
	}

	execution.save(function (err) {
		if(!err){
			res.end('Made by you');
		}
		else{
			console.log(err);
			res.end('failed');
		}
	});

}

function doElement( elementId, execution ){
	var thisElement = execution.handlers[elementId];
	var action = elementRunner[thisElement.type];
	action( elementId, execution );
}

function postAction( elementId, execution ){

	var thisElement = execution.handlers[elementId];

	if( thisElement.status === 'done' ){

		var nextElements = [];

		if( thisElement['bpmn2:outgoing'] != undefined ){
			nextElements = thisElement['bpmn2:outgoing'];
		}

		for( var i = 0; i < nextElements.length; i++ ){
			execution.runningElements.push( nextElements[i] );	
		}
	}
	else if( thisElement.status === 'pass' ){
		execution.runningElements.push( thisElement['targetRef'] );
	}
	else if( thisElement.status === 'waiting' ){
		execution.waitingElements.push( elementId );
	}

}
