// app/models/faculty.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our faculty model
var facSchema = mongoose.Schema({

	programname: String,
	sub_program: [String],
	stakeholder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'stakeholder' }],
	evaluation: [{
	    stakeholder: { type: mongoose.Schema.Types.ObjectId, ref: 'stakeholder' },
	    EvaluationMethod: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationMethod' }]

	}],
	assesmentTool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'assesmentToolSchema' }],
	structureOfCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'structure' }],
	referenceCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'referenceCurriculum' }],
	Responsibility: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Responsibility' }]



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

var ProgramManagement = mongoose.Schema({

    result: [{
        indicator: String,
        target: String,
        action: String,
        result:String
    
    }],
    meetingOfProgramManagementCommittee: [{
        meetingDate: Date,
        noOfParticipation: Number,
        percentageOfParticipation:Number


    }]
});


facSchema.methods.editProgram = function(request, response){
	console.log("Mhai eiei");
	this.programname = request.body.program_head_name;
	this.sub_program = request.body.sub_program;
	
	 
	this.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
		
    });
	 
	response.redirect('/programs');
};

var faculty = db.model('Faculty', facSchema, 'faculty');
faculty.Evaluation = db.model('EvaluationMethod', EvaluationMethodSchema, 'faculty');
faculty.Stakeholder = db.model('stakeholder', StakeholderSchema, 'faculty');
faculty.ProgramManagement = db.model('ProgramManagement', ProgramManagement, 'faculty');

module.exports = faculty;
