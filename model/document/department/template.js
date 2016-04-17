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
 * @throws {InvalidArgumentException} if empty name is given.
 * @param {string} abbriviation - A subtype document name.
 * @param {object} [keyValue2Add] - optionally add key-valued pairs to the schema. Using the notation defined by mongoose.
 * @return {object} inheritedSchema - A mongoose-modelled schema.
 */
module.exports = function(abbriviation, keyValue2Add) {
	if(!abbriviation)
		throw new InvalidArgumentException('Invalid subtype name');
	abbriviation = abbriviation.trim();

	var db = require('lib/dbclient').db();
	var Doc = require('model/document');
	var mongoose = require('mongoose');
	var autoIncrement = require('mongoose-auto-increment');

	autoIncrement.initialize(db);

	var schema = new mongoose.Schema({
		docNum: Number
	}, {discriminatorKey: 'department'});

	var plugInOptions = {
		model: abbriviation,
		field: 'docNum',
		startAt: 1,
		incrementBy: 1
	}

	if(keyValue2Add)
		schema.add(keyValue2Add);

	schema.plugin(autoIncrement.plugin, plugInOptions);

	return Doc.discriminator(abbriviation, schema);
}