var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateId: mongoose.Schema.Types.ObjectId,
	templateName: String,
	createDate: { type: Date, default: Date.now },
	executorId: String,
	runningElements: [String],
	waitingElements: [String],
	variables: [
		{ 
			name: { type: String }, 
			type: { type: String }, 
			value: { type: String } 
		}
	],
	toDocs: mongoose.Schema.Types.Mixed,
	details: mongoose.Schema.Types.Mixed,
	handlers:  mongoose.Schema.Types.Mixed,
	status: Number
});


module.exports = db.model('WorkflowExecution', schema);