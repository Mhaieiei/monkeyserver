var dbMock = require('./test/dbTestConfig');
var app = require('./app')(dbMock);
var User = require('./model/user');
var Document = require('./model/document/document');
var async = require('async');
var helper = require('./test/helperFunction');
var OfficialDocumentTemplate = require('./model/document/OfficialDocumentTemplate');

var DocXX2006Template = new OfficialDocumentTemplate('xx', 2006);
var DocXX2007Template = new OfficialDocumentTemplate('xx', 2007);
var DocXX2006 = DocXX2006Template.compile();
var DocXX2007 = DocXX2007Template.compile();

var user = new User();
user.local.username = 'joe';
user._id = user.local.username;
user.local.password = user.generateHash('joe');

var doc = new DocXX2006({
		owner: user, 
		name: 'SickLeave.docx', 
		author: user.local.username
	});
var related1 = new DocXX2006({name: 'relatedDoc1'});
var related2 = new DocXX2006({name: 'relatedDoc2'});
var attachment1 = new DocXX2007({name: 'attachment1'});
var attachment2 = new DocXX2007({name: 'attachment2'});

doc.relate2docs = [related1, related2];
doc.attachments = [attachment1, attachment2];

helper.saveMultipleItemsToDatabase([user, related1, related2, attachment1, attachment2], function() {
	doc.save(function(error) {
		if(error) throw(error);

	});
})


var http = require('http');
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});