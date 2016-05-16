'use strict'
var inherit = require('inherit');
var request = require('supertest');

var cookie;

var DmsServer = {

	__constructor: function(application) {
		this.server = request(application);
	},

	register: function(username, password) {
		return function(done) {
			var User = require('model/user');
			var user = new User();
			user._id = username;
			user.local.username = username;
			user.local.password = user.generateHash(password);

			user.save(function(error) {
				if(error) return done(error);
				return done();
			})
		}
	},

	login: function(username, password) {
		var _server = this.server;
		return function(done) {
			authenticate(_server, username, password, done)
		}
	},

	get: function(uri) {
		return this.server.get(uri)
		.set('cookie', cookie);
	},

	post: function(uri) {
		return this.server.post(uri)
	},

	postWithAuth: function(uri) {
		return this.server.post(uri)
		.set('cookie', cookie)
	}
}

function authenticate(server, username, password, done) {
    server
    .post('/login')
    .send({email: username, password: password})
    .expect(302)
    .expect('Location', '/home')
    .end(function(err, res) {
    	if (err) return done(err);
    	cookie = res.headers['set-cookie'];
       	return done();	
    });
}

module.exports = exports = inherit(DmsServer);