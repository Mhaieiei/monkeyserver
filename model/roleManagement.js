var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	members: [
		{
			_id:{type: String}
		}
	]
});

module.exports = db.model('RoleManagement', schema);