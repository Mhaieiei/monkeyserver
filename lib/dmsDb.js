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

	var dmsDB = mongoose.createConnection('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');
	return dmsDB;
}



module.exports = exports;