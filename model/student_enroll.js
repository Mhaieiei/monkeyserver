// app/models/user.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var stdEnrollSchema = mongoose.Schema({	
	
    userid : {type: String,ref:'User'},
    year : Number,
    semester : Number,
	acid : String,
	subjects	: [{
		sub_code : {type: mongoose.Schema.Types.ObjectId,ref:'Subject'},
		grade : String
	}]	

});


// create the model for users and expose it to our app
module.exports = db.model('Stdenroll', stdEnrollSchema);













