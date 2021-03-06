var rootpath = require('rootpath')();

var db = require('test/dbTestConfig');
var helper = require('test/helperFunction');
var DmsServer = require('test/DmsServer');
var fileStream = require('fs');
var expect = require('chai').expect;

var async = require('async');

// TODO: Fix test case bug occured when combine all test
// Cause: The mongoose-auto-increment-counter package create attachment counter in identitycounters collection before database got dropped from previous testcase (testDMSApi)
// Reinitialize app doesn't create identitycounters collection
describe('DMS pages HTTP request testing', function() {

	var server;
	var user = {name: 'joe', password: 'joe'}

	before(function(done) {
		var app = require('app')(db);
		server = new DmsServer(app);
		helper.registerAndLogin(server, user.name, user.password)(done);
	})

	after(function(done) {
		db.dropDb(done);
	})

	describe('Homepage', function() {
		pageShouldExist('/home');
	})

	describe.skip('Upload page', function() {
		var page = '/home/upload';
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

		it.skip('should be able to upload the file', function(done) {
			async.series([uploadFile(path2File), fileExist('./' + path2UploadFile)], done);
		})

		it.skip('should return a document object after upload the file by passing ?json=true as an URI parameter', function(done) {
			generateUploadRequest(page + '?json=true', path2File)
			.expect(200)
			.expect(function(response) {
				var document = response.body;
				expect(document._id).to.exist;
				expect(document.owner).to.equal(user.name);
				expect(document.docNum).to.exist;
				expect(document.name).to.equal(filename);
			})
			.end(done);
		})

		it.skip('should be able to download a uploaded file', function(done) {
			async.series([
				uploadFile(path2File),
				function(callback) {
					server.get('/' + path2UploadFile)
					.expect(200)
					.expect('Content-Type', 'file')
					.parse(binaryParser)
					.end(function(err, res) {
						if(err) return done(err);
						expect(Buffer.isBuffer(res.body)).to.be.ok;
						callback();
					});
				}
				],
				done);
		})

		function uploadFile(pathToFile) {
			return function(done) {
				generateUploadRequest(page, pathToFile)
				.expect(302)
				.end(done)
			}
		}

		function generateUploadRequest(pageUri, pathToFile) {
			return server.postWithAuth(pageUri)
			.attach('file', pathToFile)
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

function binaryParser(res, callback) {
    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
        callback(null, new Buffer(res.data, 'binary'));
    });
}