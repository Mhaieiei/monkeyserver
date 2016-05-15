var async = require('async');
var assert = require('chai').assert;

exports.saveMultipleItemsToDatabase = function(items, callbackWhenAllDone) {
	var toDoEachItem = function(item, done) {
		item.save(function(error) {
			assert.ifError(error);
			done();
		})
	}
	
	async.forEach(items, toDoEachItem, function(error) {
		assert.ifError(error);
		callbackWhenAllDone();
	});
}

exports.registerAndLogin = function(server, username, password) {
	return function(callback) {
		async.series([server.register(username, password), server.login(username, password)], callback);
	}
}