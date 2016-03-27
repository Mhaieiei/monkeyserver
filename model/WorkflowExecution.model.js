var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	templateId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('WorkflowExecution', schema);