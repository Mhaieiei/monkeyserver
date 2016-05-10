var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

//define schema for year study schema
var semesyearSchema = mongoose.Schema({

    ac_id: String,
    plan: String,
	Year : Number,
	semester : Number,
	subject : [{
		subcode : {type: mongoose.Schema.Types.ObjectId,ref:'Subject'},
		enroll_num : mongoose.Schema.Types.Mixed,
	}]	
	
});

var structureSchema = mongoose.Schema({

    plan: String,
    knowledgeBlock: mongoose.Schema.Types.Mixed,
     program:String


});


var teaching_semester = db.model('Yearstudy', semesyearSchema, 'teaching_semester');
teaching_semester.Structure = db.model('structure', structureSchema, 'teaching_semester');

module.exports = teaching_semester;
