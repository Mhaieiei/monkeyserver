/*
Singleton connection to DMS
Taking advantage of module caching
*/

var dmsDBConfig = require('../config/databaseconfig');
var mongoose = require('mongoose');

exports = {};
exports.createClient = function() {

	var optArgs = {
		'user': dmsDBConfig.username,
		'password': dmsDBConfig.password
	}

<<<<<<< HEAD
	//var dmsDB = mongoose.createConnection('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');

	 var dmsDB = mongoose.createConnection('mongodb://localhost:27017/nodewebapp');
=======
	// var dmsDB = mongoose.createConnection('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');

	var dmsDB = mongoose.createConnection('mongodb://localhost:27017/nodewebapp');
>>>>>>> f65e4c79940c2b4e8185699347a051635455f1d3

	return dmsDB;
}

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