var rootpath = require('rootpath')();
var expect = require('chai').expect;
var assert = require('assert');
var async = require('async');
var helper = require('test/helperFunction');

module.exports = function() {

	var User, Doc;
	var doc1, doc2, doc3, doc4;
	var document;
	var userJoe;
	User = require('model/user');
	Doc = require('model/document/document');

	before(function(done) {
		userJoe = new User({
			_id: 0,
			local: {
				name: 'joe'	
			}
		});

		userDoe = new User({
			_id: 1,
			local: {
				name: 'doe'	
			}
		});

		doc1 = new Doc({
			'owner': userJoe,
			'name': 'x_doc1',
		});

		doc2 = new Doc({
			'owner': userDoe,
			'name': 'x_doc2',
		});

		helper.saveMultipleItemsToDatabase([userJoe, userDoe, doc1, doc2], done);
	});

	describe('static methods', function() {

		it('Should find documents owned', function(done) {
			var query = Doc.findByUser(userJoe);
			query.exec(function(err, docs) {
				if(err)
					throw err;

				expect(docs.length).to.equal(1);
				for(var n = 0; n < docs.length; ++n) {
					var personId = docs[n].owner;
					expect(personId).to.equal(userJoe._id);
				}
				
				done();
			});
		});
	});

	describe('instance methods', function() {

		before(function(done) {
			Doc.findOne({owner: userJoe}).exec(function(err, doc) {
				assert.ifError(err);

				if(!doc)
					throw 'Document not found';

				document = doc;
				done();
			});
		});

		it('Should set document\'s status to "created"', function() {
			document.created();
			expect(document.getStatus()).to.equal('create');
		});

		it('Should set document\'s status to "in progress"', function() {
			document.inProgress();
			expect(document.getStatus()).to.equal('inprogress');
		});

		it('Should set document\'s status to "done"', function() {
			document.done();
			expect(document.getStatus()).to.equal('done');
		});

		it('Should set document\'s status to "waiting for approval"', function() {
			document.waitApprove();
			expect(document.getStatus()).to.equal('waiting approval');
		});
	});
};