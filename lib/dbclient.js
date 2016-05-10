/*
 * Create singleton database connection to be used globally thoughout the application.
 * It allows dependency injection which is convinient when creating mock database connection in unit testing.
 * To aquire the connection, please call "require('dbclient').db()".
 *
 * @author Apipol Niyomsak <makemek101@hotmail.com>
 */

var db;
var dbConnection;

/**
 * Set database connection interface for this object to use.
 * Make sure that this method is called first before calling 'db()' method.
 * @param {object} database - an object with interface 'createClient()' method implemented.
 */
exports.set = function(database) {
	db = database;
}

/**
 * Create a singleton database connection through interface 'createClient()'.
 * The method createClient() suppose to return a database connection object.
 * @return {object} databaseConnection - A connection to the database.
 */
exports.db = function() {
	if(!dbConnection)
		dbConnection = db.createClient();
	return dbConnection;
}
