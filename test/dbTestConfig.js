/*
This is a template for database configuration file

To use this file, please make sure to
	1. Copy-paste this file in the same directory
	2. Remove .template extension
	3. Please fill in information in required parameters
*/

/* Required parameters */
var host = 'localhost';
var port = '27017';
var database = 'dms_test';

/* Optional parameters */
var username = '';
var password = '';

/* -------------------------- */
exports.host = host;
exports.port = port;
exports.database = database;
exports.username = username;
exports.password = password;

var databaseOperationTimeoutMillisecs = 10 * 1000;
exports.dbTimeout = databaseOperationTimeoutMillisecs;

var dbConn;
exports.createClient = function() {
	dbConn = require('mongoose').createConnection(host, database, port);
	return dbConn;
}

exports.dropDb = function(done) {
	dbConn.db.dropDatabase(function (err, result) {
		done();
	});
}

exports.dbConnection = dbConn;