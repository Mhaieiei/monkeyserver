var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var idAutoIncrement = require('utility/schemaIdAutoIncrement');

var schema = new mongoose.Schema({
	workflowId: String,
	counter: Number,
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

var schemaName = 'WorkflowExecution';
schema = idAutoIncrement(schema, schemaName, 'counter');
schema.pre('save', function(next) {
	this.workflowId = 'WF' + this.counter;
	next();
})

module.exports = db.model(schemaName, schema);