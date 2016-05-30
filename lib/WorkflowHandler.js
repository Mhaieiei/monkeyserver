var Element = require('./Element');

var proElementTypes = [
	'endEvent', 
	'serviceTask', 
	'userTask',
	'manualTask',
	'exclusiveGateway',
	'parallelGateway',
	'intermediateThrowEvent',
	'intermediateCatchEvent'
];

var colElementTypes = [
	'participant'
];


var WorkflowHandler = function(){

	this.startEvent = null;
	this.endEvent = null;
	this.taskList = [];
	this.elements = {};
	this.createDocs = [];
	this.currentElements = [];
}

WorkflowHandler.prototype.getStartLaneId = function( process, collaboration ){
	var startEvents = process[0]['bpmn2:startEvent'];
	var theStartEvent = startEvents[0]['$']['id'];

	var laneSets = process[0]['bpmn2:laneSet'];
	var theStartLane = null;
	if( laneSets != undefined ){

		for( var j = 0; j < laneSets.length; j++ ){
			var lanes = laneSets[j]['bpmn2:lane'];	
			for( var k = 0; k < lanes.length; k++ ){
				var elementList = lanes[k]['bpmn2:flowNodeRef'];
				for( var i = 0; i < elementList.length; i++ ){
					if( elementList[i] === theStartEvent ){
						theStartLane = lanes[k]['$']['id'];
						break;
					}
				}
			}
		}	
	}

	console.log( 'Start Event:', theStartEvent);
	console.log( 'Start Lane:', theStartLane);
	return theStartLane;
}

WorkflowHandler.prototype.parse = function( process, collaboration ){
	this.parseProcess( process );
	this.parseCollaboration( collaboration );
}

WorkflowHandler.prototype.parseProcess = function( pro ){

	for( var i = 0; i < pro.length; i++ ){
		// find startEvent
		var startEvents = pro[i]['bpmn2:startEvent'];

		if( startEvents != undefined ){
			this.setElements( startEvents, 'startEvent' );
		}

		var sequenceFlows = pro[i]['bpmn2:sequenceFlow'];
		if( sequenceFlows != undefined ){
			this.setSequenceFlow( sequenceFlows );
		}

		for( var j = 0; j < proElementTypes.length; j++ ){
			var dummyList = pro[i][ 'bpmn2:' + proElementTypes[j] ];
			
			if( dummyList != undefined ){

				this.setElements( dummyList, proElementTypes[j] );
			}
		}

		var laneSets = pro[i]['bpmn2:laneSet'];

		if( laneSets != undefined ){
			this.setLanes( laneSets );
		}

		// set current elements with start events 
		for( var j = 0; j < startEvents.length; j++ ){
			if( !startEvents[j]['bpmn2:messageEventDefinition'] ){
				this.currentElements.push( startEvents[i]['$'].id );
			}
		}
	}
}

WorkflowHandler.prototype.setLanes = function( laneSets ){

	for( var j = 0; j < laneSets.length; j++ ){
		var lanes = laneSets[j]['bpmn2:lane'];
				
		for( var k = 0; k < lanes.length; k++ ){

			var elementList = lanes[k]['bpmn2:flowNodeRef'];
			
			for( var l = 0; l < elementList.length; l++ ){		
				this.elements[elementList[l]].laneRef = lanes[k]['$'].id;
			}

			var dummy = { 'type': 'lane' };
			this.elements[lanes[k]['$'].id] = dummy;
		}
	}
}

WorkflowHandler.prototype.parseCollaboration = function( col ){
	

	for( var i = 0; i < col.length; i++ ){

		var messageFlows = col[i]['bpmn2:messageFlow'];
		if( messageFlows != undefined ){
			this.setMessageFlow( messageFlows );
		}

		console.log( col[i] );

		for( var j = 0; j < colElementTypes.length; j++ ){
			var dummyList = col[i][ 'bpmn2:' + colElementTypes[j] ];
			if( dummyList != undefined ){
				console.log( dummyList );
				this.setElements( dummyList, colElementTypes[j] );
			}
		}
	}
}

WorkflowHandler.prototype.magic = function( xml ){
	
	var startEventXml = xml['bpmn2:startEvent'][0];
	var endEventXml = xml['bpmn2:endEvent'][0];

	this.startEvent = new Element( startEventXml['$']['id'], 'startEvent' );
	this.startEvent.outGoing = startEventXml['bpmn2:outgoing'][0];

	this.endEvent = new Element( endEventXml['$']['id'], 'endEvent' );
	this.endEvent.inComing = endEventXml['bpmn2:incoming'][0];

	this.currentTask = this.startEvent;

	var elementTypeList = [
		'endEvent', 
		'serviceTask', 
		'userTask',
		'exclusiveGateway',
		'parallelGateway',
		'intermediateThrowEvent',
		'intermediateCatchEvent'
	];

	// general elements
	for( var i = 0; i < elementTypeList.length; i++ ){
		var dummyList = xml[ 'bpmn2:' + elementTypeList[i] ];
		
		if( dummyList != undefined ){
			this.setElements( dummyList, elementTypeList[i] );
		}

	}

	// special elements
	var startEvents 		= xml['bpmn2:startEvent'];
	if( startEvents != undefined ){
		this.setElements( startEvents, 'startEvent' );
	}

	var sequenceFlows 		= xml['bpmn2:sequenceFlow'];
	if( sequenceFlows != undefined ){
		this.setSequenceFlow( sequenceFlows );
	}


	var messageFlows = xml['bpmn2:messageFlow'];
	if( messageFlows != undefined ){
		console.log("MESSAGER");
		this.setMessageFlow( messageFlows );
	}


	// set current elements with start events 
	for( var i = 0; i < startEvents.length; i++ ){
		this.currentElements.push( startEvents[i]['$'].id );
	}


}

WorkflowHandler.prototype.setMessageFlow = function( messageFlows ){
	var parameterList = ['sourceRef', 'targetRef'];	

	for( var i = 0; i < messageFlows.length; i++ ){
		
		var dummy = { 'type': 'messageFlow' };

		dummy['sourceRef'] = messageFlows[i]['$']['sourceRef'];
		dummy['targetRef'] = messageFlows[i]['$']['targetRef'];

		if( this.elements[ dummy['sourceRef'] ] != undefined ){
			var element = this.elements[ dummy['sourceRef'] ];
			if( !element['bpmn2:outgoing']  ){
				element['bpmn2:outgoing'] = [ messageFlows[i]['$'].id ];
			}
			else{
				element['bpmn2:outgoing'].push( messageFlows[i]['$'].id );
			}

		}
 
		if( this.elements[ dummy['targetRef'] ] != undefined ){
			var element = this.elements[ dummy['targetRef'] ];
			if( !element['bpmn2:incoming']  ){
				element['bpmn2:incoming'] = [ messageFlows[i]['$'].id ];
			}
			else{
				element['bpmn2:incoming'].push( messageFlows[i]['$'].id );
			}
			
		}

		this.elements[messageFlows[i]['$'].id] = dummy;

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

	if( type === 'participant'){

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