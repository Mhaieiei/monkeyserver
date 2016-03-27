// app/models/works.js
// load the things we need
var mongoose = require('mongoose');
//var extend = require('mongoose-schema-extend');
var bcrypt   = require('bcrypt-nodejs');



// define the schema for our user model
var workSchema = mongoose.Schema({
	acyear : String,
    _type : String	
});

var projectSchema = mongoose.Schema({
	_type: {type: String, default: 'advisingProject'},
	nametitle : String,
	acyear : String,
	user : [{
		iduser : {type: String,ref:'User'},
		typeuser : String,
	}]
	// advisee : [{type: String,ref:'User'}],
	// advisor :{type: String,ref:'User'},
	// coadvisor : [{type: String,ref:'User'}],
	// examiner : [{type: String,ref:'User'}],	
});

var publicResearchSchema = mongoose.Schema({
    _type : {type: String, default: 'publicResearch'},
    namepublic: String,
    acyear : String,
    typepublic: String, //national Conference, international conference..
    nameconfer: String,
    namejournal : String,
    location : String,
    vol : String,
    datenum : String,
    issue : String,
    article : String,
    page : String,
    //user advisor,advisee
    user : [{
        iduser : {type: String,ref:'User'},
        typeuser : String,
    }],    
   
});

var trainingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trainingCourse: String,
    hour: Number,
    academicYear: String
});

var careerDevelopmentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activity: String,
    hour: Number,
    academicYear: String
});

// var Work = mongoose.model('Work', workSchema, 'works');
// var exports = module.exports = Work;
// Work.Project = mongoose.model('Project', projectSchema, 'works');

module.exports = {
    Work: workSchema,
    Project: projectSchema,
    Public: publicResearchSchema,
    Training: trainingSchema,
    CareerDevelopment: careerDevelopmentSchema,
};


//module.exports = workSchema;
// create the model for users and expose it to our app
//module.exports = mongoose.model('Work', workSchema);
//module.exports = mongoose.model('Thesis', thesisSchema);














