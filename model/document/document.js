/**
 * A document schema.
 * The document contains metadata about the file, owner, and its current status.
 *
 * This module defines a mongoose schema for 'Document'.
 * Other schemas can inherit from this schema through a discrimination key.

 * @author Apipol Niyomsak <makemek101@hotmail.com>
 */

// ----------------------------------------------------------------------------

// Required libraries.
var db = require('lib/dbclient').db();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// key-valued options for configuring mongoose schema.
var options = {discriminatorKey: 'subtype'}

var schemaName = 'Document';
var docSchema = new Schema({

	/*
	 * The original user who create the document.
	 */
	owner: {
		type: String,
		ref: 'user'
	},

	author: String,

	/*
	 * A date when this record is created.
	 */
	dateCreate: {
		type: Date,
		default: Date.now
	},

	/*
	 * The filename including extension that is going to appear on the page.
	 * It is the original filename that user uploaded.
	 * If it is a by-product from the workflow, the system automatically generates it.
	 */
	name: {
		type: String,
		required: true
	},

	/*
	 * A boolean indicates whether this document is created by the system.
	 * The default value for this field is false.
	 */
	is_auto_generate: {
		type: Boolean,
		default: false
	},

	version: {
		type: Number,
		default: 1
	},

	description: String,

	permission: String,

	/*
	 * Indicates the current states document going through the workflow.
	 * Initial status for every document is 'create'.
	 * Status:
	 *    - create: The document has just created. 
	 *              It doesn't go throguh any workflow yet.
	 *    - in progress: The document is still processing inside the workflow.
	 *    - done: The document has complete the execution inside the workflow. 
	 *            Since during a workflow execution can produce multiple documents.
	 *            Those documents will also have this status set as well.
	 *    - waiting approval: The document require user to approve or reject.
	 */
	status: {
		type: String,
		enum: ['create', 'inprogress', 'done', 'waiting approval'],
		default: 'create'
	},
	
	/*
	 * List of users who is assigned to perform some tasks in this document.
	 */
	_assignees: [{
		type: Schema.Types.ObjectId,
		ref: 'user'
	}],

	/*
	 * Additional documents that involved with this document.
	 * If this document refer to other documents, put them here
	 */
	relate2docs: [{
		type: Schema.Types.ObjectId,
		ref: schemaName
	}],

	previousVersion: {
		type: Schema.Types.ObjectId,
		ref: schemaName
	},

	/*
	 * Other required documents or other dependent documents.
	 */
	attachments: [{
		type: Schema.Types.ObjectId,
		ref: schemaName
	}],

	includeInWorkflow: {
		type: Schema.Types.ObjectId,
		ref: 'workflow'
	},

	/*
	 * Absolute path to the file stored in a server.
	 * Note that the field 'name' doesn't have to be the same as 'filepath'
	 */
	filepath: String

}, options);

/**
 * Find documents owned by user ID.
 * @param {object} user object queried from mongoose.
 * @return {object[]} list of document objects.
 */
docSchema.statics.findByUser = function(user) {
	return this.find({'owner': user});
};

/**
 * Set document's status for newly created document.
 */
docSchema.methods.created = function() {
	this.status = this.schema.path('status').enumValues[0];
};

/**
 * Set document's status as processing
 */
docSchema.methods.inProgress = function() {
	this.status = this.schema.path('status').enumValues[1];
};

/**
 * Set document's status as done.
 */
docSchema.methods.done = function() {
	this.status = this.schema.path('status').enumValues[2];
};

/**
 * Set document's status as waiting approval
 */
docSchema.methods.waitApprove = function() {
	this.status = this.schema.path('status').enumValues[3];
}

/**
 * Get the current status on this document.
 * @return {string} status
 */
docSchema.methods.getStatus = function() {
	return this.status;
};

/**
 * Get a list of persons assigned in this document.
 * @return {object[]} users - a user object[]
 */
docSchema.methods.assignees = function() {
	return this._assignees;
};

/**
 * Get related documents in relate2docs field.
 */
 docSchema.methods.getRelatedDocuments = function() {
 	return this.relate2docs;
 }

docSchema.methods.getAttachments = function() {
	return this.attachments;
}

docSchema.methods.bumpVersion = function() {
	this.version = this.nextVersion();
	return this.version;
}

docSchema.methods.nextVersion = function() {
	return this.version + 1;
}

module.exports = db.model(schemaName, docSchema);


