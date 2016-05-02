var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var referenceCurriculumSchema = mongoose.Schema({

   	refProgramName: String,
    degree: String,
    university: String,
    country: String,
    website: String,

});



var referenceCurriculum = db.model('referenceCurriculum', referenceCurriculumSchema, 'referenceCurriculumSchema');

module.exports = referenceCurriculum;
