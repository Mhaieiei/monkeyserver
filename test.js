var express = require('express');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');

require('./model/log.model');


var Log = require('mongoose').model('Log');

app.get('/boy', function(req, res){
	var log = new Log({ message : "yo"});
	
	log.save( function(err){
		if(err) res.end('failed');
		else res.end('success');
	});
});

app.listen(5000, function(){
	console.log('run test');
});