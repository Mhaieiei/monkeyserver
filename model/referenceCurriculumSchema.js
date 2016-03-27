var db = require('../lib/dbclient').db();
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

var referenceCurriculum = db.model('referenceCurriculum', referenceCurriculumSchema, 'referenceCurriculumSchema');
referenceCurriculum.detail = db.model('detail', detailSchema, 'referenceCurriculumSchema');

module.exports = referenceCurriculum;
