var Element = require('./Element');


var WorkflowHandler = function(){

	this.startEvent = null;
	this.endEvent = null;
	this.taskList = [];
	this.currentTask = null;
	this.elements = {};
	this.currentElements = [];
}

WorkflowHandler.prototype.magic = function( xml ){
	var startEventXml = xml['bpmn2:startEvent'][0];
	var endEventXml = xml['bpmn2:endEvent'][0];

	this.startEvent = new Element( startEventXml['$']['id'], 'startEvent' );
	this.startEvent.outGoing = startEventXml['bpmn2:outgoing'][0];

	this.endEvent = new Element( endEventXml['$']['id'], 'endEvent' );
	this.endEvent.inComing = endEventXml['bpmn2:incoming'][0];

	this.currentTask = this.startEvent;

	var tasks = [];

	var startEvents 		= xml['bpmn2:startEvent'];
	var endEvents 			= xml['bpmn2:endEvent'];
	var normalTasks 		= xml['bpmn2:task'];
	var sendTasks 			= xml['bpmn2:sendTask'];
	var serviceTasks 		= xml['bpmn2:serviceTask'];
	var userTasks 			= xml['bpmn2:userTask'];
	var exclusiveGateways 	= xml['bpmn2:exclusiveGateway'];
	var sequenceFlows 		= xml['bpmn2:sequenceFlow'];

	if( startEvents != undefined ){
		this.setElements( startEvents, 'startEvent' );
	}

	if( startEvents != undefined ){
		this.setElements( endEvents, 'endEvent' );
	}

	if( normalTasks != undefined ){
		this.setElements( normalTasks, 'normal' );
	}

	if( sendTasks != undefined ){
		this.setElements( sendTasks, 'send' );
	}

	if( serviceTasks != undefined ){
		this.setElements( serviceTasks, 'serviceTask' );
	}
	
	if( userTasks != undefined ){
		this.setElements( userTasks, 'userTask' );
	}

	if( exclusiveGateways != undefined ){
		this.setElements( exclusiveGateways, 'exclusiveGateway' );
	}

	if( sequenceFlows != undefined ){
		this.setSequenceFlow( sequenceFlows );
	}

	// set current elements with start events 
	for( var i = 0; i < startEvents.length; i++ ){
		this.currentElements.push( startEvents[i]['$'].id );
	}


}

WorkflowHandler.prototype.setSequenceFlow = function( sequenceFlows ){
	var parameterList = ['sourceRef', 'targetRef'];

	for( var i = 0; i < sequenceFlows.length; i++ ){
		
		var dummy = { 'type': 'sequenceFlow' };


		for( var j = 0; j < parameterList.length; j++ ){
			dummy[parameterList[j]] = sequenceFlows[i]['$'][parameterList[j]];
		}

		this.elements[sequenceFlows[i]['$'].id] = dummy;
	}
}

WorkflowHandler.prototype.setElements = function( elements, type ){
	
	var parameterList = [];

	if( type === 'startEvent'){
		parameterList.push('bpmn2:outgoing');
	}
	else if( type === 'endEvent' ){
		parameterList.push('bpmn2:incoming');
	}
	else{
		parameterList.push('bpmn2:incoming');
		parameterList.push('bpmn2:outgoing');
	}


	for( var i = 0; i < elements.length; i++ ){
		
		var dummy = { 'type': type };

		for( var j = 0; j < parameterList.length; j++ ){
			dummy[parameterList[j]] = elements[i][parameterList[j]];
		}

		this.elements[elements[i]['$'].id] = dummy;
	}
}


WorkflowHandler.prototype.setup = function( xml ){

	var startEventXml = xml['bpmn2:startEvent'][0];
	var endEventXml = xml['bpmn2:endEvent'][0];

	this.startEvent = new Element( startEventXml['$']['id'], 'startEvent' );
	this.startEvent.outGoing = startEventXml['bpmn2:outgoing'][0];

	this.endEvent = new Element( endEventXml['$']['id'], 'endEvent' );
	this.endEvent.inComing = endEventXml['bpmn2:incoming'][0];

	this.currentTask = this.startEvent;

	var tasks = [];

	var normalTasks = xml['bpmn2:task'];
	var sendTasks = xml['bpmn2:sendTask'];
	var serviceTasks = xml['bpmn2:serviceTask'];
	var userTasks = xml['bpmn2:userTask'];
	var exclusiveGateways = xml['bpmn2:exclusiveGateway'];

	if( normalTasks != undefined ){
		this.setTasks( normalTasks, 'normal' );
	}

	if( sendTasks != undefined ){
		this.setTasks( sendTasks, 'send' );
	}

	if( serviceTasks != undefined ){
		this.setTasks( serviceTasks, 'service' );
	}
	
	if( userTasks != undefined ){
		this.setTasks( userTasks, 'user' );
	}

	if( exclusiveGateways != undefined ){
		this.setTasks( exclusiveGateways, 'exclusiveGateway' );
	}


	this.connectElements();

}


WorkflowHandler.prototype.connectElements = function(){

	// set start connect
	for( var i = 0; i < this.taskList.length; i++ ){
		
		if( this.taskList[i].inComing == this.startEvent.outGoing ){
			this.startEvent.next = this.taskList[i];
		}
	}

	var currentElement = this.startEvent.next;

	while( currentElement !== null ){

		for( var i = 0; i < this.taskList.length; i++ ){
		
			if( currentElement.outGoing == this.taskList[i].inComing ){
				currentElement.next = this.taskList[i];
			}
		}

		if( currentElement.outGoing == this.endEvent.inComing){
			currentElement.next = this.endEvent;
			break;
		}

		currentElement = currentElement.next;

	}

}


WorkflowHandler.prototype.run = function(){

	var currentElement = this.startEvent;

	while( currentElement !== null ){

		console.log( currentElement.toString() );

		currentElement = currentElement.next;
	}
}

WorkflowHandler.prototype.getFirst = function( xml, key ){
	return xml[key][0];
}

WorkflowHandler.prototype.setStartEvent = function( event ){

	this.startEvent = new Element( event['$']['id'], "startEvent" );

}

WorkflowHandler.prototype.setEndEvent = function( event ){
	this.endEvent = new Element( event['$']['id'], "endEvent" );
}

WorkflowHandler.prototype.addTask = function( task ){

}

WorkflowHandler.prototype.toString = function(){

	var text = "";
	
	text += this.startEvent.toString();

	for( var i = 0; i < this.taskList.length; i++ ){
		text += this.taskList[i];
	}

	text += this.endEvent.toString();

	return text;
}

WorkflowHandler.prototype.setTasks = function(tasks, type){



	for( var i = 0; i < tasks.length; i++ ){
		
		var dummy = new Element( tasks[i]['$']['id'], type );
		dummy.name = tasks[i]['$']['name'];
		dummy.inComing = tasks[i]['bpmn2:incoming'][0];
		dummy.outGoing =  tasks[i]['bpmn2:outgoing'][0];

		
		this.taskList.push( dummy );
	}


}



module.exports = WorkflowHandler;