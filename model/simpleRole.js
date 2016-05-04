var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	description: String,
	members: [String]
});

module.exports = db.model('SimpleRole', schema);