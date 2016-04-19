var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateId: mongoose.Schema.Types.ObjectId,
	currentTask: String,
	variables: [
		{ 
			name: { type: String }, 
			type: { type: String }, 
			value: { type: String } 
		}
	],
	elements: mongoose.Schema.Types.Mixed,
	handler:  mongoose.Schema.Types.Mixed
});

module.exports = db.model('WorkflowExecution', schema);