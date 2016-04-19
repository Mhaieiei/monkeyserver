// app/models/faculty.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our faculty model
var programSchema = mongoose.Schema({

	programname: String,
	stakeholder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'stakeholder' }],
	evaluation: [{
	    stakeholder: { type: mongoose.Schema.Types.ObjectId, ref: 'stakeholder' },
	    EvaluationMethod: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationMethod' }]

	}],
	assesmentTool: [String],
	structureOfCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'structure' }],
	referenceCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'referenceCurriculum' }],
	Responsibility: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Responsibility' }],
	
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
    ELO: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ELO' }]

});






var program = db.model('program', programSchema, 'program');
program.Evaluation = db.model('EvaluationMethod', EvaluationMethodSchema, 'program');
program.Stakeholder = db.model('stakeholder', StakeholderSchema, 'program');

module.exports = program;
