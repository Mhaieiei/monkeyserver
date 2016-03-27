/*
This is a template for database configuration file

To use this file, please make sure to
	1. Copy-paste this file in the same directory
	2. Remove .template extension
	3. Please fill in information in required parameters
*/

//mongodb://<dbuser>:<dbpassword>@ds025409.mlab.com:25409/monkeynode

/* Required parameters */
var host = 'ds025409.mlab.com';
var port = '25409';
var database = 'monkeynode';

/* Optional parameters */
var username = 'monkeyadmin';
var password = 'monkeyoffice';

/* -------------------------- */
exports.host = host;
exports.port = port;
exports.database = database;
exports.username = username;
exports.password = password;
