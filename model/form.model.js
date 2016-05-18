var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	elements: [ 
		{ 	
			type: { type: String }, 
			name: { type: String }, 
			label: { type: String }, 
			predefinedValue: { type: String } 
		} 
	]
});

module.exports = db.model('Form', schema);