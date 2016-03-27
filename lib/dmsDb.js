/*
Singleton connection to DMS
Taking advantage of module caching
*/

var dmsDBConfig = require('../config/databaseconfig');
var mongoose = require('mongoose');

var conn2db = function() {

	var optArgs = {
		'user': dmsDBConfig.username,
		'password': dmsDBConfig.password,
		'auth': {
			authdb: 'admin'
		}
	}

	var dmsDB = mongoose.createConnection('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');

	/*var dmsDB = mongoose.createConnection(
		dmsDBConfig.host,
		dmsDBConfig.database,
		dmsDBConfig.port,
		optArgs
	);*/
	
	return dmsDB;
}

module.exports = conn2db();