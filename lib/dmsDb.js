/**
 * This file implements interface required in {@link dbclient} in order to connect to the database.
 * The application will use the database connection to generate database schema and perform CRUD operations.
 * 
 * @author Apipol Niyomsak <makemek101@hotmail.com>
 */

var dmsDBConfig = require('../config/databaseconfig');
var mongoose = require('mongoose');

exports = {};

/**
 * Create a database instance.
 * @return {object} databaseConnection - a database connection created by mongoose.
 */
exports.createClient = function() {

	var optArgs = {
		'user': dmsDBConfig.username,
		'password': dmsDBConfig.password
	}

	var dmsDB = mongoose.createConnection('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');


	 //var dmsDB = mongoose.createConnection('mongodb://localhost:27017/nodewebapp');

	 //var dmsDB = mongoose.createConnection('mongodb://localhost:27017/nodewebapp');

	

	return dmsDB;
}

/**
 * Check whether the system can connect to the database.
 * If the connection is not successful, it will log error message to the console.
 * @param {object} databaseConnection - A mongoose database connection.
 */
function verifyConnection(databaseConnection) {
	databaseConnection.on('open', function(ref) {
		console.log('Connected to Mongo server');
	});

	databaseConnection.on('error', function(err) {
		console.log('Could not connect to Mongo server');
		console.error(err);
	});
}

module.exports = exports;