var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	elements: [ 
		{ 
			name: { type: String }, 
			type: { type: String }, 
			value: { type: String } 
		} 
	]
});

module.exports = mongoose.model('Form', schema);