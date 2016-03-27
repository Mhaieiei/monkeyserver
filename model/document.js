var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var docSchema = new Schema({

	owner: {
		type: String,
		ref: 'user'
	},

	type: String,
	dateCreate: {
		type: Date,
		default: Date.now
	},
	name: String,
	author: String,
	status: {
		type: String,
		enum: ['create', 'inprogress', 'done'],
		default: 'create'
	},
	
	_assignees: [{
		type: Schema.Types.ObjectId,
		ref: 'user'
	}],

	relate2docs: [{
		type: Schema.Types.ObjectId,
		ref: 'document'
	}],

	includeInWorkflow: [{
		type: Schema.Types.ObjectId,
		ref: 'workflow'
	}],

	filepath: String
});

docSchema.statics.findByUser = function(user) {
	return this.find({'owner': user});
};

docSchema.methods.created = function() {
	this.status = this.schema.path('status').enumValues[0];
};
docSchema.methods.inProgress = function() {
	this.status = this.schema.path('status').enumValues[1];
};
docSchema.methods.done = function() {
	this.status = this.schema.path('status').enumValues[2];
};

docSchema.methods.getStatus = function() {
	return this.status;
};

docSchema.methods.assignees = function() {
	return this._assignees;
};

module.exports = db.model('Document', docSchema);


