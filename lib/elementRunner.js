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
	console.log("DO serviceTask");
	/*mapParameters('input');
	runScript();
	mapParameters('output');*/
}

function userTask(elementId, execution){
	
	return new Promise(function(resolve){
		console.log("DO userTask");
		mapParameters('input', elementId, execution);
		var thisElement = execution.handlers[elementId];	
		thisElement['status'] = 'waiting';
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
	console.log( 'show' + type + ' parameters' );

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

}

