var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateId: mongoose.Schema.Types.ObjectId,
	runningElements: [String],
	waitingElements: [String],
	variables: [
		{ 
			name: { type: String }, 
			type: { type: String }, 
			value: { type: String } 
		}
	],
	details: mongoose.Schema.Types.Mixed,
	handlers:  mongoose.Schema.Types.Mixed
});

module.exports = db.model('WorkflowExecution', schema);