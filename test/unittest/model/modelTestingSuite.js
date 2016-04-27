var rootpath = require('rootpath')();
var expect = require('chai').expect;
var assert = require('assert');
var dbMock = require('test/dbTestConfig');
var app = require('app')(dbMock);

describe('Database Collections Entity Testing', function() {

	makeSuite('Document Model', function() {
		describe('Base Schema', require('./document/testDocumentModel'));
		describe('Document Sub Type Template Creator', require('./document/testTemplateCreation'));
		describe('Document Sub Type Template Creator constructed by year', require('./document/testTemplateCreationByYear'));
		describe('IC Documents', require('./document/testICDocuments'));
	});

	after(function(done) {
		dbMock.dropDb(done);
	})
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