var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateId: mongoose.Schema.Types.ObjectId
});

module.exports = db.model('WorkflowExecution', schema);