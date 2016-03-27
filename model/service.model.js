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

module.exports = mongoose.model('Service', schema);