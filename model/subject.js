// app/models/user.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var subjectSchema = mongoose.Schema({	
    
	
	sub_code : String,
	sub_name	: String,
	sub_credit	: Number,
	sub_lecter : [{type: String,ref:'User'}],	
    sub_type: String, //compulsory sub, thesis sub
    ELO: [{
    supportLevel: String,
    ELO: { type: mongoose.Schema.Types.ObjectId, ref: 'ELO' }

}]

});

var ELOSchema = mongoose.Schema({

    title: String,
    description: String,
    number:Number
    
});



subjectSchema.methods.editSubject = function(request, response){	
	console.log("Edit subject method");	
	var index = request.query.id;
	console.log(index);
	this.sub_code = request.body.sub_code;
	this.sub_name = request.body.sub_name;
	this.sub_credit = request.body.sub_credit;
	this.sub_lecter = request.body.sub_lecter;
	 
	this.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
		
    });
	response.redirect('/subjects');


};

var subject = db.model('Subject', subjectSchema, 'subject');
subject.ELO = db.model('ELO', ELOSchema, 'subject');

module.exports = subject;
