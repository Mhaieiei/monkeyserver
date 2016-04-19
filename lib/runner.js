var WorkflowExecution	= require('../model/WorkflowExecution.model');
var Service 			= require('../model/service.model');
var Form				= require('../model/form.model');

module.exports = {
  runWorkflow: runWorkflow,
  mapOutput: mapOutput
}

function runWorkflow( execution, res){
	
	console.log('==== start run workflow ====');

	var currentTask = execution.handler.currentTask;

	if( currentTask.type === "user"){
		runUserTask( execution, res );
	}
	else if( currentTask.type === "service"){
		runServiceTask( execution, res );
	}
	else{
		execution.handler.currentTask = currentTask.next;
		runWorkflow(execution, res);
	}	 
}

function runUserTask(execution, res){

	var currentElementId = execution.handler.currentTask.id;
	var currentElement = execution.elements[currentElementId];

	//do input mapping
	var wfVariables = execution.variables;
	var inputMappings = [];

	if( currentElement.inputMappings !== undefined ){
		inputMappings = currentElement.inputMappings;
	}
	
	Form.findOne({ "_id": currentElement.form.id }, function(err, result){

		var formElements = result.elements;

		if(err) console.log(err);

		for(var i = 0; i < inputMappings.length; i++){			
			for(var j = 0; j < formElements.length; j++){
				if( inputMappings[i].first === formElements[j].name ){
					for(var k = 0; k < wfVariables.length; k++ ){
						if( inputMappings[i].second === wfVariables[k].name ){
							inputMappings[i].value = wfVariables[k].value;
						}
					}
				}
			}
		}

		WorkflowExecution.update({ _id: execution._id}, 
			{ 	'handler.currentTask': execution.handler.currentTask,
				'elements': execution.elements
			 }, 
		function(err){
			
			if(!err) {
				console.log('succesful update in runUserTask');
			}
			else{
				console.log('error');
			}
			res.redirect("/");
		});
	});

}

function runServiceTask(execution, res){

	console.log('======= start run service');

	var currentElementId = execution.handler.currentTask.id;
	var currentElement = execution.elements[currentElementId];
	var wfVariables = execution.variables;

	Service.findOne({ '_id' : currentElement.serviceId }, function(err, result){
		
		if(err) console.log(err);

		var svInputs = result.inputs;
		var svOutputs = result.outputs;

		var inputMappings = [];
		if( currentElement.inputMappings !== undefined ){
			inputMappings = currentElement.inputMappings;
		}
		
		// initial service variables (input mappings)
		for(var i = 0; i < inputMappings.length; i++){
			for(var j = 0; j < svInputs.length; j++){
				if( inputMappings[i].first === svInputs[j].name ){
					for(var k = 0; k < wfVariables.length; k++){
						if( inputMappings[i].second === wfVariables[k].name ){
							eval( "var " + svInputs[j].name + " = " + wfVariables[k].value );
						}
					}
				}
			}
		}		

		// run script
		eval( result.script );
		
		
		// out put mappings
		var outputMappings = [];
		if( currentElement.outputMappings !== undefined ){
			outputMappings = currentElement.outputMappings;
		}

		for(var i = 0; i < outputMappings.length; i++){
			for(var j = 0; j < wfVariables.length; j++){
				if(outputMappings[i].first === wfVariables[j].name){
					for(var k = 0; k < svOutputs.length; k++){
						if(outputMappings[i].second === svOutputs[k].name){
							wfVariables[j].value = eval( svOutputs[k].name );
						}
					}
				}
			}
		}


		execution.handler.currentTask = execution.handler.currentTask.next;
		
		WorkflowExecution.update({ _id: execution._id },
			{ 'variables': execution.variables, 'handler': execution.handler },
			
			function(err){
				if(err) console.log('error');
				else console.log('update succesful');

				runWorkflow(execution, res);
			}
		);

	});
	
}


function mapInput( task ){

	console.log("======== start map input");
	if( task === undefined || task.inputMappings === undefined ){
		console.log("========  no map input");
		return;
	}
	
	for(var i = 0; i < task.inputMappings.length; i++ ){
		console.log( task.inputMappings[i]);
	}
	console.log("======== end map input ");
	
}

function mapOutput(execution, inputData){

	console.log("======== start map output");

	var currentElementId = execution.handler.currentTask.id;
	var currentElement = execution.elements[currentElementId];
	
	var outputVariables = currentElement.outputMappings;
	var wfVariables = execution.variables;

	if( outputVariables === undefined ){
		return;
	}

	for( var i = 0; i < outputVariables.length; i++ ){
		
		if( inputData[ outputVariables[i].second ] !== undefined ){

			for( var j = 0; j < wfVariables.length; j++ ){

				if( wfVariables[j].name === outputVariables[i].first ){
					wfVariables[j].value = inputData[ outputVariables[i].second ];

					console.log( wfVariables[j].name + " = " + inputData[ outputVariables[i].second ] );
				}
			}

		}
	}


	console.log("======== end map output");
}