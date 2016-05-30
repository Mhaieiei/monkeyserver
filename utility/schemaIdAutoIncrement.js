'use strict';

module.exports = exports = function(schema, modelName, fieldName2Increment) {
	var database = require('lib/dbclient').db();
	var autoIncrement = require('mongoose-auto-increment');
	autoIncrement.initialize(database);

	var plugInOptions = {
		model: modelName,
		field: fieldName2Increment,
		startAt: 1,
		incrementBy: 1,
		unique: false
	}

	schema.plugin(autoIncrement.plugin, plugInOptions);
	return schema;
}
