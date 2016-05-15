var rootpath = require('rootpath')();

var db = require('test/dbTestConfig');

var dbMock = require('test/dbTestConfig');
var helper = require('test/helperFunction');
var DmsServer = require('test/DmsServer');
var fileStream = require('fs');
var expect = require('chai').expect;

var async = require('async');

describe.only('DMS pages HTTP request testing', function() {

	var server;

	before(function(done) {
		require('app')(db);
		var app = require('app')(dbMock);
		server = new DmsServer(app);
		helper.registerAndLogin(server, 'joe', 'joe')(done);
	})

	after(function(done) {
		db.dropDb(done);
	})

	describe('Homepage', function() {
		pageShouldExist('/home');
	})

	describe('Upload page', function() {
		var page = '/upload';
		var filename = 'fileToUpload.txt';
		var path2File = 'test/resource/' + filename;
		var path2UploadFile = 'uploads/document/' + filename;

		beforeEach(function(done) {
			removeFile(path2UploadFile)(done);
		});

		afterEach(function(done) {
			removeFile(path2UploadFile)(done);
		})

		pageShouldExist(page);

		it('should be able to upload the file', function(done) {
			async.series([uploadFile(path2File), fileExist('./' + path2UploadFile)], done);
		})

		it('should return a document object after upload the file', function(done) {
			generateUploadRequest(path2File)
			.expect(function(response) {
				expect(response.document).to.exist;
				expect(response.document.id).to.exist;
				expect(response.document.name).to.equal(filename);
			})
			.end(done);
		})

		function uploadFile(pathToFile) {
			return function(done) {
				generateUploadRequest(pathToFile)
				.end(done)
			}
		}

		function generateUploadRequest(pathToFile) {
			return server.postWithAuth(page)
			.attach('file', pathToFile)
			.expect(302)
		}

		function fileExist(pathToFile) {
			return function(done) {
				expect(function() {
					fileStream.readFile(pathToFile, function(err, data) {
						if(err) throw err;
						done();
					})
				}).to.not.throw(Error);
			}
		}

		function removeFile(pathToFile) {
			return function(done) {
				fileStream.readFile(path2UploadFile, function(err, data) {
					hasFile = !(err && err.errno == -4058);
					if(hasFile)
						fileStream.unlinkSync(pathToFile);
					done();
				})
			}	
		}

	});

	function pageShouldExist(uri) {
		return it('URI: ' + uri + ' exists', function(done) {
			server.get(uri)
			.expect(200)
			.end(done);
		})
	}

})
