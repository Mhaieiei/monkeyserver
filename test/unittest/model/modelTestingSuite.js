var rootpath = require('rootpath')();
var expect = require('chai').expect;
var assert = require('assert');
var dbMock = require('test/dbTestConfig');

describe('Database Collections Entity Testing', function() {

	before(function() {
		var app = require('app')(dbMock);
	})

	makeSuite('Document Model', function() {
		describe('Base Schema', require('./testDocumentModel'));
		describe('Document Sub Type Template Creator', require('./document/department/testTemplateCreation'));
		describe('Document Sub Type', function() {
			var DocumentFactory = require('model/document/department/DocumentFactory');
			var subtypeDocumentTester = require('./document/department/testDocumentSubType');

			for(var subtypeDocument in DocumentFactory) {
				describe('Subtype Document: ' + subtypeDocument, function() {
					subtypeDocumentTester(DocumentFactory[subtypeDocument]);
				})
			}
		});
	});
})

function makeSuite(name, tests) {
	describe(name, function() {

		tests();

		// shared after
		after(function(done) {
			dbMock.dropDb(done);
		});		

	});
}