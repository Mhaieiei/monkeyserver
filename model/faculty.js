// app/models/faculty.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our faculty model
var facSchema = mongoose.Schema({

	programname: String,
	sub_program: [String]

<<<<<<< HEAD
=======
	}],
	assesmentTool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'assesmentToolSchema' }],
	structureOfCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'structure' }],
	referenceCurriculum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'referenceCurriculum' }],
	Responsibility: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Responsibility' }],
	noOfStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'noOfStaff' }],
});

var noOfStaffSchema = mongoose.Schema({

    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    academicYear: String,
    program: String,
    type:String //academic staff, support staff
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

    programtrack : String,
    management : mongoose.Schema.Types.Mixed
>>>>>>> 8f9039f82f65a2259d6c0f76cb8211d333deadbb
});



var faculty = db.model('faculty', facSchema, 'faculty');

module.exports = faculty;
