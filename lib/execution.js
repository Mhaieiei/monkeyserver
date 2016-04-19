var express 			= require('express');
var router  			= express.Router();
var WorkflowExecution 	= require('../model/WorkflowExecution.model');
var Form				= require('../model/form.model');
var runner				= require('./runner');

router.get('/', function(req, res){

	WorkflowExecution.find({}, function(err, result){
		if(err) console.log(err);
		res.render('wf/execution/all', { layout: 'homePage', result: result} );
	});

});


router.get('/:id', function(req, res){

	WorkflowExecution.findOne( { "_id" : req.params.id }, function(err, execution){

		if(err) console.log(err);


		var currentElementId = execution.handler.currentTask.id;
		var currentElement = execution.elements[currentElementId];
		var inputMappings = [];
		
		
		if( currentElement.inputMappings !== undefined ){
			inputMappings = currentElement.inputMappings;
		}

		if( execution.handler.currentTask.type === 'service' ){

			res.end("Service");
			return;
		} 
		Form.findOne({ "_id": currentElement.form.id }, function(err, result){

			var elements = [];
			if( result.elements !== null ) elements = result.elements;

			for(var i = 0; i < inputMappings.length; i++){
				for( var j = 0; j < elements.length; j++ ){
					if( inputMappings[i].first === elements[j].name ){
						elements[j].value = inputMappings[i].value;
					}
				}
			}

			var formHtml = '<form method="post" action="/execution/' + execution._id + '">';
		
			for(var i = 0; i < elements.length; i++){
				formHtml += '<div>' + getHtmlElement( elements[i] ) + '</div>';
			}
			
			formHtml += '<input type="submit" value="Submit">';

			res.render('execution/one', { html: formHtml });
		});		
	});

});

router.post('/:id', function(req, res){

	// deal with output mapping
	WorkflowExecution.findOne( { "_id" : req.params.id }, function(err, execution){

		runner.mapOutput(execution, req.body);

		execution.handler.currentTask = execution.handler.currentTask.next;
		
		WorkflowExecution.update({ _id: execution._id },
			{ 'variables': execution.variables, 'handler': execution.handler },
			
			function(err){
				if(err) console.log('error');
				else console.log('update succesful');

				runner.runWorkflow(execution, res);
			}
		);
	});

});

function getHtmlElement( element ){

	var html = "";

	if( element.type === "label" ){
		html += "<b>" + element.value + "</b>";
	}
	else if( element.type ==="textbox" ){
		html += '<input type="text" name="' + element.name + '">';
	}

	return html;
}

function executeTask(id){
	WorkflowExecution.findOne( { "_id" : id }, function(err, execution){

		var currentTask = execution.elements[execution.handler.currentTask.id]
		var wfVariables = execution.variables;
		var inputMappings = currentTask.inputMappings;

		if( inputMappings !== undefined ){
			for(var i = 0; i < inputMappings.length; i++ ){
				for(var j = 0; j < wfVariables.length; j++){
					if( inputMappings[i].second === wfVariables[j].name ){
						inputMappings[i].value = wfVariables[j].value;
					}
				}
			}
		}

		var thisElement = "elements." + execution.handler.currentTask.id + ".inputMappings";
		console.log(thisElement);
		WorkflowExecution.update({ _id: execution._id}, 
		{ thisElement : inputMappings }, 
		function(err){
			
			if(!err) {
				console.log('succesful update');
			}
			else{
				console.log('error');
			}
	
			
		});
		

	});
}


function mapping(){

}

function executeWorkflow(execution, res){
	console.log('execute workflow');

	var currentElement = execution.handler.currentTask;

	while( currentElement !== null ){

		//console.log( currentElement.toString() );
		if( currentElement.type === "user" ){
			 execution.handler.currentTask = currentElement;
			 break;
		}

		currentElement = currentElement.next;
	}
	

	WorkflowExecution.update({ _id: execution._id}, 
		{ 'handler.currentTask': currentElement }, 
		function(err){
			
			if(!err) {
				console.log('succesful update');
			}
			else{
				console.log('error');
			}
			res.redirect('/');
		});


}



module.exports = router;