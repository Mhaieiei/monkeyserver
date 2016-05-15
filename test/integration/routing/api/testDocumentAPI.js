var rootpath = require('rootpath')();

var expect = require('chai').expect;

var assert = require('assert');
var async = require('async');

var dbMock = require('test/dbTestConfig');
var helper = require('test/helperFunction');
var TemplateByYear = require('model/document/OfficialDocumentTemplate');
var DmsServer = require('test/DmsServer');

describe('REST Document API', function() {

	var app, server, cookie;
	var DocumentTemplate;

	var document;
	var relatedDocument, attachment;
	var previousDocument, previouseOfPreviousDocument;

	before(function(done) {
		app = require('app')(dbMock);
		server = new DmsServer(app);
		async.parallel([createDummyDocuments, helper.registerAndLogin(server, 'joe', 'joe')], done);
	})

	describe('Get document by document ID', function() {

		var URL = getApiUrl('read');

		testRespondJson(URL);
		testInvalidId(URL, null, 'null');

		it('should return the correct document', function(done) {
			APIHttpRequest(URL.concat(document.id))
			.expect(function(response) {
				var result = response.body;
				isSameRecord(document, result);
			})
			.end(done);
		})

		it('should return all previous versions of the parent document', function(done) {
			URL += document.id;
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
			APIHttpRequest(URL.concat(document.id))
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
			APIHttpRequest(URL.concat(document.id))
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
		it('should return ' + messageTypeResponse + 'given non-existent document ID', function(done) {
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
