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
		var path2UploadFile = './uploads/files/' + filename;

		pageShouldExist(page);

		it('should be able to upload the file', function(done) {
			async.series([uploadFile(path2File), fileExist(path2UploadFile)], done);
		})

		function uploadFile(pathToFile) {
			return function(done) {
				server.postWithAuth(page)
				.attach('file', pathToFile)
				.expect(302)
				.end(done)
			}
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
	})

	function pageShouldExist(uri) {
		return it('URI: ' + uri + ' exists', function(done) {
			server.get(uri)
			.expect(200)
			.end(done);
		})
	}

})

function readFile() {

}