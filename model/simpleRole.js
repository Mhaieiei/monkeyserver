var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}]
});

module.exports = db.model('SimpleRole', schema);