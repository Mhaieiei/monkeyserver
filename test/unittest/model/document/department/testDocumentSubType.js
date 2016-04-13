var rootpath = require('rootpath')();
var expect = require('chai').expect;
const assert = require('assert');

var dbMock = require('test/dbTestConfig');
var app = require('app')(dbMock);

module.exports = function(SubTypeDoc) {

	var doc1, doc2;
	before(function(done) {
		createDoc(function(_doc1) {
			createDoc(function(_doc2) {
				doc1 = _doc1;
				doc2 = _doc2;
				done();
			})
		})
	})

	it('documentID should start at 1', function(done) {
		expect(doc1.docNum).to.equals(1);
	});

	it('documentID should increment by 1', function(done) {
		expect(doc2.docNum).to.equals(2);
	})

	function createDoc(then) {
		var doc = new SubTypeDoc();
		doc.save(function(err) {
			assert.ifError(err);
			then(doc);
		});	
	}
};