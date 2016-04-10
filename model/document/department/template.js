module.exports = function(abbriviation, keyValue2Add) {
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