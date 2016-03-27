var Schema = require('mongoose').Schema;

var docSchema = new Schema({
	personReceive: {
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
	return this.find({'personReceive': user});
};

docSchema.statics.findByAuthor = function(author, resultCallbackFunction) {
	return this.find({'author': author}, resultCallbackFunction);
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

docSchema.methods.personResponsible = function() {
	return this.personReceive;
};

module.exports = docSchema;


