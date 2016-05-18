var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateName: String,
	taskName: String,
	workflowExecutionId: mongoose.Schema.Types.ObjectId,
	createDate: { type: Date, default: Date.now },
	doerId: String,
	roleId: String,
	elementId: String,
	details: mongoose.Schema.Types.Mixed 
});


module.exports = db.model('WorkflowTask', schema);