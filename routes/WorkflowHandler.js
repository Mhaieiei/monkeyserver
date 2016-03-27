var Element = require('./Element');


var WorkflowHandler = function(){

	this.startEvent = null;
	this.endEvent = null;
	this.taskList = [];
}

WorkflowHandler.prototype.setup = function( xml ){

	var startEventXml = xml['bpmn2:startEvent'][0];
	var endEventXml = xml['bpmn2:endEvent'][0];

	this.startEvent = new Element( startEventXml['$']['id'], 'startEvent' );
	this.startEvent.outGoing = startEventXml['bpmn2:outgoing'][0];

	this.endEvent = new Element( endEventXml['$']['id'], 'endEvent' );
	this.endEvent.inComing = endEventXml['bpmn2:incoming'][0];

	var tasks = [];

	var normalTasks = xml['bpmn2:task'];
	var sendTasks = xml['bpmn2:sendTask'];

	if( normalTasks != undefined ){
		this.setTasks( normalTasks, 'normal' );
	}
	
	if( sendTasks != undefined ){
		this.setTasks( sendTasks, 'send' );
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

		if(type === 'send'){
			dummy.attributes = [
				{ 
					name : 'to',
					type : 'email' 
				},
				{ 
					name : 'subject',
					type : 'text' 
				},
				{ 	
					name : 'body',
					type : 'text'
				}
			];
		}

		this.taskList.push( dummy );
	}


}



module.exports = WorkflowHandler;