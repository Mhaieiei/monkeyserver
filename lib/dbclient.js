var db;
var dbConnection;

exports.set = function(database) {
	db = database;
}

exports.db = function() {
	if(!dbConnection)
		dbConnection = db.createClient();
	return dbConnection;
}