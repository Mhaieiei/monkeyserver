var rootpath = require('rootpath')();

var expect = require('chai').expect;

var assert = require('assert');
var async = require('async');

var fileStream = require('fs');
var path = require('path');

var dbMock = require('test/dbTestConfig');
var helper = require('test/helperFunction');
var TemplateByYear = require('model/document/OfficialDocumentTemplate');
var DmsServer = require('test/DmsServer');
var Attachment = require('model/document/attachment');

describe('REST Document API', function() {

	var app, server, cookie;
	var DocumentTemplate;
	var user = {username: 'joe', password: 'joe'}
	var document;
	var relatedDocument, attachment;
	var previousDocument, previouseOfPreviousDocument;

	before(function(done) {
		app = require('app')(dbMock);
		server = new DmsServer(app);
		async.parallel([createDummyDocuments, helper.registerAndLogin(server, user.username, user.password)], done);
	})

	describe('Get document by document ID', function() {

		var URL = getApiUrl('read');

		testRespondJson(URL);
		//testInvalidId(URL, {}, 'empty json'); // find by _id with invalid value cause internal server error status (500)

		it('should return the correct document', function(done) {
			APIHttpRequest(URL.concat(document.id))
			.expect(function(response) {
				var result = response.body;
				expect(result.docId).to.exist;
				isSameRecord(document, result);
			})
			.end(done);
		})

		it('should return all previous versions of the parent document', function(done) {
			URL += document.docId;
			URL += '/' + 'allPreviousVersions'
			APIHttpRequest(URL)
			.expect(function(response) {
				var result = response.body;
				expect(result).to.exist;
				isSameRecord(previousDocument, result.previousVersion);
				isSameRecord(previouseOfPreviousDocument, result.previousVersion.previousVersion);
			})
			.end(done);
		})
	})

	describe('Get related document', function() {

		var URL = getApiUrl('ref');

		testRespondJson(URL);
		testInvalidId(URL, [], 'empty json array');

		it('should return all related document given document ID', function(done) {
			APIHttpRequest(URL.concat(document.docId))
			.expect(function(response) {
				var result = response.body;
				expect(result.length).to.equal(1);
				isSameRecord(relatedDocument, result[0]);
			})
			.end(done);
		})

	})

	describe("Get document's attachment", function() {

		var URL = getApiUrl('attach');

		testRespondJson(URL);
		testInvalidId(URL, [], 'empty json array');

		it('should return all attachments given document ID', function(done) {
			APIHttpRequest(URL.concat(document.docId))
			.expect(function(response) {
				var result = response.body;
				expect(result.length).to.equal(1);
				isSameRecord(attachment, result[0]);
			})
			.end(done);
		})

		it("should return user's attachments", function() {
			APIHttpRequest(URL)
			.expect(function(response) {
				var result = response.body;
				expect(result.length).to.equal(1);
				isSameRecord(attachment, result[0]);
			})
		})
	})

	describe.skip('Generate document from parameters passed by workflow system', function() {
		var url = getApiUrl('upload');
		
		var mongoGeneratedId = '573b48271df7e15826a9ef1b'
		var existingAttachment = {
			displayName: 'attachment',
			executionId: mongoGeneratedId,
			filepath: 'some/where1'
		}
		var newAttachment = {
			displayName: 'newAttachment',
			executionId: mongoGeneratedId,
			filepath: 'some/where2'
		}
		var formParameters = {			
			displayName: 'leave form',
			HTMLContent: 
			'<html>' +
			'<title>Hello World!</title>' +
			'<p>This is a html form</p> ' +
			'</html>',
			executionId: mongoGeneratedId	
		}

		var requiredParametersSentFromWorkflow = {
			recipient: user.username,
			form: formParameters,
			attachment: [existingAttachment, newAttachment]
		}

		var responseFromApi;

		before(function(done) {
			async.series([
				function(callback) {
					var attachmentDocument = new Attachment();
					attachmentDocument.docId = existingAttachment.docId;
					attachmentDocument.name = existingAttachment.displayName;
					attachmentDocument.includeInWorkflow = existingAttachment.executionId;
					attachmentDocument.filepath = existingAttachment.filepath;
					attachmentDocument.save(callback);
					existingAttachment.docId = attachmentDocument.docId;
				},
				function(callback) {
					server
					.postWithAuth(url)
					.send(requiredParametersSentFromWorkflow)
					.expect(function(response){responseFromApi = response.body})
					.end(callback)
				}
				], done);
		})

		it('should create form in HTML format from the given html content', function(done) {
			var filepath = path.resolve('uploads/document/form/' + formParameters.displayName + '.html')
			fileStream.readFile(filepath, 'utf8', function(err, html) {
				if(err) done(err);
				expect(html).to.equal(formParameters.HTMLContent);
				done();
			})
		})

		it('should create document and return form and attachments as document object json response', function() {
			console.log(responseFromApi);
			var form = responseFromApi.form;
			var attachment = responseFromApi.attachment;
			expect(form).to.exist;
			expect(form.owner).to.equal(requiredParametersSentFromWorkflow.recipient);
			expect(form.docId).to.exist;
			expect(form.is_auto_generate).to.be.true;
			expect(form.status).to.match(/done/i);

			expect(attachment).to.exist;
			expect(attachment.length).to.equal(requiredParametersSentFromWorkflow.attachment.length);
			attachment.forEach(function(_attachment) {
				expect(_attachment.docId).to.exist;
				expect(_attachment.owner).to.equal(requiredParametersSentFromWorkflow.recipient);
				expect(_attachment.filepath).to.exist;
				expect(_attachment.status).to.match(/done/i);
			});
			expect(form.attachments.length).to.equal(requiredParametersSentFromWorkflow.attachment.length);
			attachment.forEach(function(_attachment) {
				expect(_attachment.docId).to.exist;
				expect(_attachment.owner).to.equal(requiredParametersSentFromWorkflow.recipient);
				expect(_attachment.filepath).to.exist;
				expect(_attachment.status).to.match(/done/i);
			});
		})
	})

	after(function(done) {
		dbMock.dropDb(done);
	})

	function createDummyDocuments(done) {
		var templateName = 'xx', year = 1234;
		DocumentTemplate = new TemplateByYear(templateName, year);
		DocumentXX = DocumentTemplate.compile();

		includeOneRelatedDocument(function(relatedDoc) {
			relatedDocument = relatedDoc;
			attachment = relatedDoc;

			var documentFields = {
				name: 'document1', 
				relate2docs: relatedDocument, 
				attachments: attachment,
				version: '3'
			}
			document = new DocumentXX(documentFields);
			previouseOfPreviousDocument = new DocumentXX(documentFields);
			previouseOfPreviousDocument.version = '1';
			previousDocument = new DocumentXX(documentFields);
			previousDocument.version = '2';

			previousDocument.previousVersion = previouseOfPreviousDocument;
			document.previousVersion = previousDocument;


			helper.saveMultipleItemsToDatabase([document, previousDocument, previouseOfPreviousDocument], done);
		});		
	}

	function APIHttpRequest(url) {
		return server
		.get(url)
		.expect('Content-Type', /json/)
		.expect(200)
	}

	function urlExist(url) {
		return function(done) {
			APIHttpRequest(url.concat(document.id))
			.end(done);
		}
	}

	function testInvalidId(url, expectedResponse, messageTypeResponse) {
		it('should return ' + messageTypeResponse + ' given non-existent document ID', function(done) {
			var invalidId = -1;
			APIHttpRequest(url.concat(invalidId))
			.expect(expectedResponse)
			.end(done);
		})
	}

	function testRespondJson(url) {
		it(url + ':documentID should respond with json', urlExist(url));
	}
})

function isSameRecord(expectedRecord, actualRecord) {
	expect(expectedRecord._id.toString()).to.equal(actualRecord._id.toString());
}

function getApiUrl(link) {
	var rootURL = '/api/document/';
	return rootURL.concat(link).concat('/');
}

function APIHttpRequest(url, agent) {
	return agent
	.get(url)
	.expect('Content-Type', /json/)
	.expect(200)
}

function includeOneRelatedDocument(callback) {
	var Template = new TemplateByYear('zz', 2001);
	var DocXXType = Template.compile();

	var relatedDocument1 = new DocXXType({name: 'relatedDocument'});

	var doc = [relatedDocument1];
	helper.saveMultipleItemsToDatabase(doc, function() {
		callback(doc[0]);
	})
}
