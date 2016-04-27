module.exports = {
	'startEvent': startEvent,
	'endEvent': endEvent,
  	'serviceTask': serviceTask,
  	'userTask': userTask,
  	'sequenceFlow': sequenceFlow,
  	'parallelGateway': parallelGateway
};

function startEvent(elementId, execution){
	console.log("DO startEvent");
	var thisElement = execution.handlers[elementId];
	thisElement['status'] = 'done';
}

function endEvent(elementId, execution){
	console.log("DO endEvent");
	var thisElement = execution.handlers[elementId];
	thisElement['status'] = 'done';
}


function serviceTask(elementId, execution){
	console.log("DO serviceTask");
	/*mapParameters('input');
	runScript();
	mapParameters('output');*/
}

function userTask(elementId, execution){
	console.log("DO userTask");
	var thisElement = execution.handlers[elementId];
	thisElement['status'] = 'waiting';
	mapParameters('input', elementId, execution );
}

function sequenceFlow(elementId, execution){
	console.log("DO sequenceFlow");
	var thisElement = execution.handlers[elementId];
	thisElement['status'] = 'pass';
}

function parallelGateway(elementId, execution){

}

function exclusiveGateway(elementId, execution){

}

function mapParameters(type, elementId, execution){
	var thisElement = execution.details[elementId];
	console.log( '	show' + type + ' parameters' );

	var parameterList = [];
	if( thisElement[type+'Mappings'] != undefined ){
		parameterList = thisElement[type+'Mappings'];
	}

	for( var i = 0; i < parameterList.length; i++ ){
		console.log( parameterList[i].first + " - " + parameterList[i].second );
	}
	

}

