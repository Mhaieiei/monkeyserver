var rootpath = require('rootpath')();
var expect = require('chai').expect;

var config = require('test/dbTestConfig');
var mongoose = require('mongoose');
var db_test = mongoose.createConnection(config.host, config.database, config.port);


describe('Test document model', function() {
	var authorX = 'x';
	var authorY = 'y';

	var User, Doc;
	var doc1, doc2, doc3, doc4;
	var document;
	var userJoe;

	before(function(done) {
		User = db_test.model('user', require('model/user'));
		Doc = db_test.model('document', require('model/document'));
		userJoe = new User({
			'local': {
				'name': 'joe'	
			}
		});
		userJoe.save(done);
	});

	beforeEach(function(done) {
		// add dummy data
		doc1 = new Doc({
			'personReceive': userJoe._id,
			'author': authorX,
			'name': 'x_doc1',
		});

		doc2 = new Doc({
			'personReceive': userJoe._id,
			'author': authorX,
			'name': 'x_doc2',
		});

		doc3 = new Doc({
			'author': authorX,
			'name': 'x_doc3',
		});

		doc4 = new Doc({
			'author': authorY,
			'name': 'y_doc1',
		});

		doc1.save(errorCallback);
		doc2.save(errorCallback);
		doc3.save(errorCallback);
		doc4.save(errorCallback);
		this.timeout(config.dbTimeout);
		Doc.findByAuthor(authorX, function(err, docs) {
			if(err)
				throw err;
			document = docs[0];
			done();
		});		
	})

	afterEach(function(done) {
		this.timeout(config.dbTimeout);
		db_test.db.dropDatabase(function(err, result) {
			if(err)
				throw err;
			done();
		});
	});

	describe('static methods', function() {
		it('Should give documents owned by ' + authorX, function(done) {
			expectAuthorToHaveDoc(Doc.findByAuthor(authorX), [doc1, doc2, doc3], done);
		});

		it('Should give documents owned by ' + authorY, function(done) {
			expectAuthorToHaveDoc(Doc.findByAuthor(authorY), [doc4], done);
		});

		it('Should find documents that user received from others', function(done) {
			var query = Doc.findByUser(userJoe);
			query.exec(function(err, docs) {
				if(err)
					throw err;

				expect(docs.length).to.equal(2);
				for(var n = 0; n < docs.length; ++n) {
					var personId = docs[n].personResponsible();
					var samePerson = personId.equals(userJoe._id);
					expect(samePerson).to.be.true;
				}
				
				done();
			});
		});
	});

	describe('instance methods', function() {


		it('Should set document\'s status to "created"', function(done) {
			document.created();
			expect(document.getStatus()).to.equal('create');
			done();
		});

		it('Should set document\'s status to "in progress"', function(done) {
			document.inProgress();
			expect(document.getStatus()).to.equal('in progress');
			done();
		});

		it('Should set document\'s status to "done"', function(done) {
			document.done();
			expect(document.getStatus()).to.equal('done');
			done();
		});
	});
});

function expectAuthorToHaveDoc(query, docs, done) {
	query.exec(function(err, docs) {
		if(err)
			throw err;
		
		expect(docs.length).to.equal(docs.length);
		done();
	});	
}

var errorCallback = function(err) {
	if(err)
		throw err;
}