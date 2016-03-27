var http = require('http');
var db =  require('./lib/dmsDb');
var app = require('./app')(db);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
