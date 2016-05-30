'use strict';

var router = require('express').Router();
var Document = require('model/document/document');
var Role = require('model/simpleRole');
var isLoggedIn = require('middleware/loginChecker');
var async = require('async');

router.get('/:docId/visibility', isLoggedIn, function(req, res, next) {
	var response = {layout: 'homePage'};
	response.docId = req.params.docId;

	async.parallel([fetchRole(), fetchDocument(response.docId)], function(error) {
		if(error) next(error);

		tickCheckbox();

		console.log(JSON.stringify(response.roleGroup));
		res.render('document/visibility.hbs', response);
	})


	function fetchRole() {
		return function(done) {
			Role.find().exec(function(error, roles) {
				if(error) done(error);
				response.role = roles;
				done();
			})
		}
	}

	function fetchDocument(documentId) {
		return function(done) {
			Document.findOne({docId: documentId})
			.populate('visibility')
			.exec(function(error, document) {
				if(error) done(error);
				response.document = document;
				done();
			})
		}
	}

	function tickCheckbox() {
		for(var idx = 0; idx < response.role.length; ++idx) {
			response.role[idx] = {value: response.role[idx], checked: false}
		}
		
		for(var role = 0; role < response.document.visibility.length; ++role) {
			var visibilityRoleId = response.document.visibility[role]._id.toString();

			for(var n = 0; n < response.role.length; ++n) {
				var responseRoleId = response.role[n].value._id.toString();

				if(responseRoleId === visibilityRoleId) {
					response.role[n].checked = true;
				}
				
			}
		}
	}
})

router.post('/:docId/visibility', isLoggedIn, function(req, res, next) {

	Document.findOne({docId: req.params.docId, owner: req.user})
	.exec(function(error, document) {
		if(error) return next(error);

		document.visibility = req.body.permitRole;

		document.save(function(error) {
			if(error) next(error);
			console.log(document);
			res.redirect('/home');
		})
	})


})

module.exports = exports = router;