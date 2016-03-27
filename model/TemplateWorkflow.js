var db = require('../lib/dbclient').db();
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

module.exports = db.model('TemplateWorkflow', schema);