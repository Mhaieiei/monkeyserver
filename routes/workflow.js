var express 			= require('express');
var TemplateWorkflow 	= require('../models/TemplateWorkflow');
var Form				= require('../models/form.model');
var Service 			= require('../models/service.model');
var WorkflowHandler		= require('./WorkflowHandler');
var parseString 		= require('xml2js').parseString;
var nodemailer			= require('nodemailer');
var transporter 		= nodemailer.createTransport('smtps://iceonepiece%40gmail.com:jaratrawee1234@smtp.gmail.com');

var router  			= express.Router();


router.get('/saveservice', function(req, res){
	
	var service = new Service( { 
		name: "Age Calculator", 
		description: "use to calculate age",
		
		inputs: [
			{
				name: "day",
				type: "Number"
			},
			{
				name: "month",
				type: "Number"
			},
			{
				name: "year",
				type: "Number"
			}
		],
		
		outputs: [
			{
				name: "age",
				type: "Number"
			}
		],
		
		script: ""
	});

	service.save(function (err) {
		if(!err){
			console.log('Save form !!!');
			res.end('succesful');
		}
		else{
			console.log(err);
			res.end('failed');
		}

	});

});

router.get('/', function(req, res){
	res.render('workflow/index',{layout:"workflowMain"});
});

router.get('/execute', function(req, res){

	TemplateWorkflow.find({}, function(err, result){

		if(err) console.log(err);

		res.render('workflow/execute', { layout: "workflowMain",workflows : result } );
	});

});

router.get('/tester', function(req, res){
	var form = new Form( { 
		name: "Age Calculator", 
		description: "use to calculate age from birthdate",
		elements: [
			{
				name: "nameLabel", 
				type: "label", 
				value: "Name"
			},
			{
				name: "nameTextbox", 
				type: "textbox", 
				value: ""
			},

			{
				name: "dayLabel", 
				type: "label", 
				value: "Day"
			},
			{
				name: "dayTextbox", 
				type: "textbox", 
				value: ""
			},

			{
				name: "monthLabel", 
				type: "label", 
				value: "Month"
			},
			{
				name: "monthTextbox", 
				type: "textbox", 
				value: ""
			},

			{
				name: "yearLabel", 
				type: "label", 
				value: "Year"
			},
			{
				name: "yearTextbox", 
				type: "textbox", 
				value: ""
			}
		]
	});

	form.save(function (err) {
		if(!err){
			console.log('Save form !!!');
			res.end('succesful');
		}
		else{
			console.log(err);
			res.end('failed');
		}

	});
});

router.get('/create', function(req, res){

	Form.find({}, function(err, result){
		if(err) console.log(err);
		console.log( "Form: " + result );
		res.render('workflow/create',{layout:"workflowMain", forms: result});
	});
});


router.post('/save', function(req, res){

	var tpWorkflow = new TemplateWorkflow( { 
		name: req.body.name, 
		description: req.body.description,
		xml: req.body.xml,
		variables: req.body.variables,
		elements: req.body.elements
	} );
	
	tpWorkflow.save(function (err) {
		if(!err){
			console.log('Save template workflow !!!');
			res.end('succesful');
		}
		else{
			console.log(err);
			res.end('failed');
		}

	});
});


router.get('/:id/profile', function(req, res){
	
	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

		res.render('workflow/single/profile', { layout:"workflowMain",workflow: result } );
	});

	
	

});


router.get('/:id/execute', function(req, res){

	TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){
		var xml = result.xml;

		parseString(xml, function (err, strResult) {

			var elements = strResult["bpmn2:definitions"]["bpmn2:process"][0];
			var keys = Object.keys( elements );


			var handler = new WorkflowHandler();

		
			handler.setup( elements );
			handler.run();
		
			console.log( handler.taskList );
    		res.render( "workflow/single/execute", { 
    			layout:"workflowMain",
    			tasks : handler.taskList,
    			id : req.params.id
    		});
		});
	});
});


router.post('/:id/execute', function(req, res){

	var mailOptions = {
	    from: 'Jaratrawee <iceonepiece@gmail.com>', // sender address 
	    to: req.body.to, 
	    subject: req.body.subject,  
	    html: req.body.body
	};
 
	// send mail with defined transport object 
	transporter.sendMail(mailOptions, function(error, info){
    	if(error){
        	return console.log(error);
    	}
    	res.end("DONE");
    	console.log('Message sent: ' + info.response);
	});
});


module.exports = router;
