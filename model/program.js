// app/models/faculty.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our faculty model
var programSchema = mongoose.Schema({

	programname: String,
	stakeholder: [{ type: String, ref: 'stakeholder' }],
	evaluation: [{
	    stakeholder: String,
	    EvaluationMethod: [{ 
	    	methodName: String,
    		frequency: String 
    	}]

	}],
	assesmentTool: [String],
	structureOfCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'structure' }],
	referenceCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'referenceCurriculum' }],
	Responsibility: [{ type: String, ref: 'Responsibility' }],
	
    Programmanagement : mongoose.Schema.Types.Mixed



});



var EvaluationMethodSchema = mongoose.Schema({

    methodName: String,
    frequency: String
});

var StakeholderSchema = mongoose.Schema({

    type: String,
    title: String,
    requirement: [String],
    program:String,
    ELO: [{ type: String, ref: 'ELO' }]

});






var program = db.model('program', programSchema, 'program');
program.Evaluation = db.model('EvaluationMethod', EvaluationMethodSchema, 'program');
program.Stakeholder = db.model('stakeholder', StakeholderSchema, 'program');

module.exports = program;
