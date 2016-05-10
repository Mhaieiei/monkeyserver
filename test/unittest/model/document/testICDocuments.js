var rootpath = require('rootpath')();
var chai = require('chai');
var expect = chai.expect;
var like = chai.use(require('chai-like'));
const assert = require('assert');

var async = require('async');

var IC = require('model/document/ICDocuments');
var dbMock = require('test/dbTestConfig');

module.exports = function() {
	
	before(function(done) {
		dbMock.dropDb(done);
	})

	it('should give the same document template when initilized more than once', function() {
		initilzeTimes = 3;
		var year = 2006;

		var ICDocs = IC(year);
		while(initilzeTimes > 0) {
			var sameICDocs = IC(year);
			expect(ICDocs).like(sameICDocs);

			sameICDocs = ICDocs;
			initilzeTimes -= 1;
		}
	})

	it('initialize with different year should give a different template', function() {
		var IC2007 = IC(2007);
		var IC2008 = IC(2008);

		expect(IC2007).to.not.like(IC2008);
	})

	it('all documents are able to query', function() {
		var ICDocs = IC(2009);
		for(docType in ICDocs) {
			var template = ICDocs[docType];
			expect(template.find).to.exist;
			expect(template.findByUser).to.exist;
		} 
	})

	after(function(done) {
		dbMock.dropDb(done);
	});
}