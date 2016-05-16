var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	workflowExecutionId: mongoose.Schema.Types.ObjectId,
	doerId: String,
	roleId: String,
	elementId: String,
	details: mongoose.Schema.Types.Mixed 
});


module.exports = db.model('WorkflowTask', schema);