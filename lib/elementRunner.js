var Service = require('../model/service.model');

module.exports = {
	'startEvent': startEvent,
	'endEvent': endEvent,
  	'serviceTask': serviceTask,
  	'userTask': userTask,
  	'sequenceFlow': sequenceFlow,
  	'parallelGateway': parallelGateway
};

function startEvent(elementId, execution){

	return new Promise(function(resolve){
		console.log("DO startEvent");
		var thisElement = execution.handlers[elementId];
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

		if( execution.details[elementId].submitResults != undefined ){
			console.log("POST userTask");
			mapParameters('output', elementId, execution );
			thisElement['status'] = 'done';
		}
		else{
			console.log("Pre userTask");
			mapParameters('input', elementId, execution);
			thisElement['status'] = 'waiting';
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

}

function exclusiveGateway(elementId, execution){

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

