var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	xml: String,
	variables: [
		{ 	name: String,
			type: String, 
			value: String
		}
	],
	elements: mongoose.Schema.Types.Mixed
}, {strict: false});

module.exports = mongoose.model('TemplateWorkflow', schema);