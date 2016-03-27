var mongoose = require('mongoose');

//define schema for year study schema
var semesyearSchema = mongoose.Schema({

    ac_id: String,
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'structure' },
	Year : Number,
	semester : Number,
	subject : [{
		subcode : {type: mongoose.Schema.Types.ObjectId,ref:'Subject'},
		enroll_num : mongoose.Schema.Types.Mixed,
	}]	
	
});

var structureSchema = mongoose.Schema({

    plan: String,
    knowledgeBlock: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeBlock' }]


});

var KnowledgeBlockSchema = mongoose.Schema({

    type: String,
    creditRequired: Number,
    subjectType: String

});




// create the model for year and expose it to our app
module.exports = {

    TeachingSemester: semesyearSchema,
    KnowledgeBlock: KnowledgeBlockSchema,
    Structure: structureSchema
}