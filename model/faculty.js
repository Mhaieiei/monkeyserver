// app/models/faculty.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our faculty model
var facSchema = mongoose.Schema({

	programname: String,
	sub_program: [String]

});

var faculty = db.model('faculty', facSchema, 'faculty');

module.exports = faculty;
