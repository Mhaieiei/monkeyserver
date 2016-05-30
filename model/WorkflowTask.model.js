var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var idAutoIncrement = require('utility/schemaIdAutoIncrement');

var schema = new mongoose.Schema({
	taskId: String,
	counter: Number,
	templateName: String,
	taskName: String,
	workflowExecutionId: mongoose.Schema.Types.ObjectId,
	createDate: { type: Date, default: Date.now },
	doerId: String,
	roleId: String,
	elementId: String,
	details: mongoose.Schema.Types.Mixed 
});

var schemaName = 'WorkflowTask';
schema = idAutoIncrement(schema, schemaName, 'counter');
schema.pre('save', function(next) {
	this.taskId = 'WFTASK' + this.counter;
	next();
})

module.exports = db.model('WorkflowTask', schema);