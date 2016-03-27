var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	inputs: [
		{ 	
			name: { type: String }, 
			type: { type: String } 
		}
	],
	outputs: [
		{ 	
			name: { type: String }, 
			type: { type: String } 
		}
	],
	script: String
}, {strict: false});

module.exports = db.model('Service', schema);