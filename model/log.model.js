var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	message: String
});

module.exports = mongoose.model('log', schema);