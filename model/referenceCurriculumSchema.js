var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var referenceCurriculumSchema = mongoose.Schema({

    programname:String,
    detail: [{ type: mongoose.Schema.Types.ObjectId, ref: 'detail' }]

});

var detailSchema = mongoose.Schema({

    refProgramName: String,
    degree: String,
    university: String,
    country: String,
    website: String,
    

});


//var referenceCurriculum = mongoose.model('referenceCurriculum', referenceCurriculumSchema, 'referenceCurriculumSchema');
//module.exports = referenceCurriculum;
//referenceCurriculum.detail = mongoose.model('detail', detailSchema, 'referenceCurriculumSchema');
module.exports = {
    ReferenceCurriculum: referenceCurriculumSchema,

    Detail:detailSchema
}