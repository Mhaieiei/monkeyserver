var mongoose = require('mongoose');

//define schema for year study schema
var acyearSchema = mongoose.Schema({

	academic_year : Number,
	program_name : String,
	
	
});

// create the model for year and expose it to our app
module.exports = acyearSchema;