var Service = require('../model/service.model');

module.exports = {
	'startEvent': startEvent,
	'endEvent': endEvent,
  	'serviceTask': serviceTask,
  	'userTask': userTask,
  	'sequenceFlow': sequenceFlow,
  	'exclusiveGateway': exclusiveGateway,
  	'parallelGateway': parallelGateway,
  	'messageFlow': messageFlow,
  	'intermediateThrowEvent': interThrowEvent,
  	'intermediateCatchEvent': interCatchEvent
};

function startEvent(elementId, execution){

	return new Promise(function(resolve){
		console.log("DO startEvent");
		var thisElement = execution.handlers[elementId];
		var thisLane = execution.handlers[ thisElement['laneRef'] ];

		if( thisLane != undefined ){
			thisLane.doerId = execution.executorId;
			console.log(thisLane);
		}

		thisElement['status'] = 'done';
		resolve();
	});

}

function endEvent(elementId, execution){
	return new Promise(function(resolve){
		console.log("DO endEvent");
		var thisElement = execution.handlers[elementId];
		thisElement['status'] = 'done';
		resolve();
	});
}


function serviceTask(elementId, execution){
	
	return new Promise(function(resolve){

		var thisElement = execution.details[elementId];
		
		mapParameters('input', elementId, execution );

		Service.findOne({'_id': thisElement.serviceId }, function(err, serviceResult){

			var inputs = serviceResult.inputs;
			var outputs = serviceResult.outputs;

			// initialize service variables
			for( var i = 0; i < inputs.length; i++ ){
				if( thisElement.inputResults[inputs[i].name] != undefined ){
					eval( 'var ' + inputs[i].name + ' = ' +  thisElement.inputResults[inputs[i].name] + ';' );
				}
				else{
					eval( 'var ' + inputs[i].name + ';' );
				}
			}

			for( var i = 0; i < outputs.length; i++ ){
				eval( 'var ' + outputs[i].name + ';' );
			}

			// run service task's script
			eval( serviceResult.script );

			var submitResults = {};

			for( var i = 0; i < outputs.length; i++ ){
				eval( 'submitResults.' + outputs[i].name + ' = ' + outputs[i].name + ';' );
			}

			thisElement.submitResults = submitResults;

			mapParameters('output', elementId, execution );
			execution.handlers[elementId]['status'] = 'done';
			resolve();

		});
		

	});
}

function userTask(elementId, execution){
	
	return new Promise(function(resolve){
		console.log("DO userTask");

		var thisElement = execution.handlers[elementId];
		console.log(thisElement);
		console.log("DONE userTask");

		if( execution.details[elementId].submitResults != undefined ){
			console.log("XXXX");
			console.log("POST userTask");
			mapParameters('output', elementId, execution );
			thisElement['status'] = 'done';
		}
		else{
			console.log("YYYY");
			console.log("Pre userTask");
			mapParameters('input', elementId, execution);
			thisElement['status'] = 'wait';

		}
		resolve();
	});

}

function sequenceFlow(elementId, execution){
	return new Promise(function(resolve){
		console.log("DO sequenceFlow");
		var thisElement = execution.handlers[elementId];
		thisElement['status'] = 'pass';
		resolve();
	});
}

function parallelGateway(elementId, execution){
	return new Promise(function(resolve){
		console.log("DO ParallelGateway");
		var elementHandler = execution.handlers[elementId];
		var incomings = elementHandler['bpmn2:incoming'];

		if( incomings === undefined ){
			incomings = [];
		}

		var count = 0;

		for( var i = 0; i < incomings.length; i++ ){
			if( execution.handlers[incomings[i]].status === 'pass' ){
				count++;
			}
		}

		if( count === incomings.length ){
			elementHandler.status = 'done';
		}
		resolve();

	});

}

function exclusiveGateway(elementId, execution){
	
	return new Promise(function(resolve){

		console.log("DO exclusiveGateway");
		var elementDetail = execution.details[elementId];
		var elementHandler = execution.handlers[elementId];
		var conditionList = elementDetail.conditions;

		var wfVariables = execution.variables;
		
		//set up wf variables
		for( var i = 0; i < wfVariables.length; i++ ){
			eval( 'var ' + wfVariables[i].name + ' = ' + wfVariables[i].value + ';' );
		}

		var targetRef = '';
		for( var i = 0; i < conditionList.length; i++ ){
		
			if( eval( conditionList[i].content ) ){
				
				var outgoings = [];
				if( elementHandler['bpmn2:outgoing'] != undefined ){
					outgoings = elementHandler['bpmn2:outgoing'];
				}

				for( var j = 0; j < outgoings.length; j++ ){
					if( execution.details[ outgoings[j] ].conditionName === conditionList[i].name ){
						targetRef = outgoings[j];
						break;
					}
				}
			}
			if(targetRef != '') break;
		}

		elementHandler.status = 'pass';
		elementHandler.targetRef = targetRef;
		resolve();
	});
}

function messageFlow(elementId, execution){
	return new Promise(function(resolve){
		console.log("DO messageFlow");
		var thisElement = execution.handlers[elementId];
		thisElement['status'] = 'pass';
		resolve();
	});
}

function interThrowEvent(elementId, execution){
	return new Promise(function(resolve){
	});
}

function interCatchEvent(elementId, execution){
	return new Promise(function(resolve){
	});
}


function mapParameters(type, elementId, execution){
	var thisElement = execution.details[elementId];
	var wfVariables = execution.variables;

	var parameterList = [];
	if( thisElement[type+'Mappings'] != undefined ){
		parameterList = thisElement[type+'Mappings'];
	}

	if( type === 'input' ){
		var inputResults = {};

		for( var i = 0; i < parameterList.length; i++ ){
			console.log( parameterList[i] );
			for( var j = 0; j < wfVariables.length; j++ ){

				if( parameterList[i].second === wfVariables[j].name ){
					
					inputResults[parameterList[i].first] = wfVariables[j].value;
				}
			}
		}

		thisElement.inputResults = inputResults;
	}
	else if( type === 'output' ){

		var submitResults = {};
		if( thisElement.submitResults != undefined ){
			submitResults = thisElement.submitResults;
		}

		for( var i = 0; i < parameterList.length; i++ ){
			console.log( parameterList[i] );
			for( var j = 0; j < wfVariables.length; j++ ){

				if( parameterList[i].first === wfVariables[j].name ){
					wfVariables[j].value = submitResults[parameterList[i].second];
				}
			}
		}

	}
}


