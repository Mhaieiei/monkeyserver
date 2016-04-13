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

facSchema.methods.editProgram = function(request, response){
    console.log("Edit program");
    this.programname = request.body.program_head_name;
    this.sub_program = request.body.sub_program;
    
     
    this.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
        
    });
     
    response.redirect('/programs');
};

var faculty = db.model('faculty', facSchema, 'faculty');

module.exports = faculty;
