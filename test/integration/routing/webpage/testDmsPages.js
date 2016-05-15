var rootpath = require('rootpath')();

var db = require('test/dbTestConfig');

var dbMock = require('test/dbTestConfig');
var helper = require('test/helperFunction');
var DmsServer = require('test/DmsServer');

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

	function pageShouldExist(uri) {
		return it('URI: ' + uri + ' exists', function(done) {
			server.get(uri)
			.expect(200)
			.end(done);
		})
	}

})