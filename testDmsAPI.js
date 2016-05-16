var db = require('./test/dbTestConfig'); // persist data in locally
// var db = require('./lib/dmsDb'); // persist in online monkeyOffice database server

var app = require('./app')(db);
var User = require('./model/user');
var Document = require('./model/document/document');
var async = require('async');
var helper = require('./test/helperFunction');
var OfficialDocumentTemplate = require('./model/document/OfficialDocumentTemplate');
var Attachment = require('./model/document/attachment');

var DocXX2006Template = new OfficialDocumentTemplate('xx', 2006);
var DocXX2007Template = new OfficialDocumentTemplate('xx', 2007);
var DocXX2006 = DocXX2006Template.compile();
var DocXX2007 = DocXX2007Template.compile();

var user = createUser('joe', 'joe'); user.save() // local user
// var user = createUser('admin', 'admin');

async.series([
	function(done) {
		documentWithAttachmentsAndRelated(user, done);
	},
	function(done) {
		documentWithOlderVersions(user, done);
	}
	], function(error) {
		if(error) throw error;
		startServer();
	});

function documentWithAttachmentsAndRelated(creator, done) {
	var doc = new DocXX2006({
			owner: creator, 
			name: 'SickLeave.docx', 
			author: creator.local.username
		});
	var related1 = new DocXX2006({name: 'relatedDoc1'});
	var related2 = new DocXX2006({name: 'relatedDoc2'});
	var attachment1 = new Attachment({name: 'attachment1'});
	var attachment2 = new Attachment({name: 'attachment2'});

	doc.relate2docs = [related1, related2];
	doc.attachments = [attachment1, attachment2];

	helper.saveMultipleItemsToDatabase([related1, related2, attachment1, attachment2], function() {
		doc.save(function(error) {
			done(error);
		});
	})	
}

function documentWithOlderVersions(creator, done) {
	var metadata = {
		owner: creator,
		name: 'Resign.docx',
		author: creator.local.username,
	}

	metadata.version = '1';
	var docVersion1 = new DocXX2006(metadata);
	metadata.version = '2';
	var docVersion2 = new DocXX2006(metadata);
	metadata.version = '3';
	var docVersion3 = new DocXX2006(metadata);

	docVersion3.previousVersion = docVersion2;
	docVersion2.previousVersion = docVersion1;

	async.each(
		[docVersion1, docVersion2, docVersion3],
		function(item, callback) {
			item.save(callback);
		},
		function(error) {
			done(error);
		}
	)
}

function createUser(name, password) {
	var user = new User();
	user.local.username = name;
	user._id = user.local.username;
	user.local.password = user.generateHash(password);
	return user;
}

function startServer() {
	var http = require('http');
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});	
}