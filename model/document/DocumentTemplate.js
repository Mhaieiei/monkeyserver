'use strict';
var inherit = require('inherit');

/**
 * Subtype document schema templating module.
 * @module model/document/department/template
 * @author Apipol Niyomsak <makemek101@hotmail.com>
 * 
 * Create a schema inherited from {@link document} schema model with the following extra fields:
 *  - docNum: An incremental integer field starting at 1.
 *            It increments by 1 each time new record are saved automatically.
 *            This field is a part of generating ID to identify records.
 *            This field is controlled by 'mongoose-auto-increment'.
 *            A plug-in in which increment an integer on a spcified fields.
 * Please note that subtype name will be trimmed first before creating a schema.
 * @throws error if the name already exists.
 * @throws error if empty name is given.
 * @param {string} subtypeName - A subtype document name.
 * @param {object} [additionalFields] - optionally add key-valued pairs to the schema. Using the notation defined by mongoose.
 * @return {object} inheritedSchema - A mongoose-modelled schema.
 */

var Template = {
	__constructor: function(subtypeName, additionalFields) {
		if(!subtypeName)
			throw new Error('Invalid subtype name');
		subtypeName = subtypeName.trim();

		this.subtypeName = subtypeName;
		this.additionalFields = additionalFields;
		this.schema = createSchema(this.subtypeName, this.additionalFields);
	},

	compile: function() {
		var Doc = require('model/document/document');
		return Doc.discriminator(this.subtypeName, this.schema);
	},

	getSubtypeName: function() {
		return this.subtypeName;
	},

	getSchema: function() {
		return this.schema;
	}
}

function createSchema(subtypeName, additionalFields) {
	var mongoose = require('mongoose');
	var schema = new mongoose.Schema({
		id: String,
		docNum: Number
	}, {discriminatorKey: 'subtype'});

	if(additionalFields)
		schema.add(additionalFields);

	var plugInOptions = {
		model: subtypeName,
		field: 'docNum',
		startAt: 1,
		incrementBy: 1,
		unique: false
	}
	schema = installMongooseAutoIncrementPlugin(schema, plugInOptions);
	schema.pre('save', function(next) {
		this.id = subtypeName.concat(this.docNum);
		next();
	})
	return schema;
}

function installMongooseAutoIncrementPlugin(schema, plugInOptions) {
	var database = require('lib/dbclient').db();
	var autoIncrement = require('mongoose-auto-increment');
	autoIncrement.initialize(database);
	schema.plugin(autoIncrement.plugin, plugInOptions);
	return schema;
}

module.exports = exports = inherit(Template);