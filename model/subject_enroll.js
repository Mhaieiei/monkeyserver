// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var subEnrollSchema = mongoose.Schema({	
    
	acid : String,
	sub_code : {type: mongoose.Schema.Types.ObjectId,ref:'Subject'},
	student	: [{
		yearattend : Number,
		userid : {type: String,ref:'User'},
		grade : String
	}]	

});


// create the model for users and expose it to our app
module.exports = subEnrollSchema;













