'use strict';

var router = require('express').Router();
var Document = require('model/document/document');
var Role = require('model/role');
var isLoggedIn = require('middleware/loginChecker');
var async = require('async');

router.get('/:docId/visibility', isLoggedIn, function(req, res, next) {
	var response = {layout: 'homePage'};
	response.docId = req.params.docId;

	async.parallel([groupPositionByRow(), fetchDocument(response.docId)], function(error) {
		if(error) next(error);

		tickCheckbox();

		console.log(JSON.stringify(response.roleGroup));
		res.render('document/visibility.hbs', response);
	})


	function groupPositionByRow() {
		return function(done) {
			var showRoleField = {type: "$type"};
			var aggregatePosition = {$push: "$position"};
			var roleTypeGroup = {
				$group: {
					_id: showRoleField,
					position: aggregatePosition
				}
			}
			
			Role.aggregate([roleTypeGroup])
			.exec(function(error, roleGroup) {
				if(error) done(error);
				response.roleGroup = roleGroup;
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
		for(var role = 0; role < response.roleGroup.length; ++role) {
			var rolePosition = response.roleGroup[role].position;

			for(var allowRole = 0; allowRole < response.document.visibility.length; ++allowRole) {
				var permitRole = response.document.visibility[allowRole];
				permitRole = JSON.parse(JSON.stringify(permitRole));
				var foundIdx = rolePosition.indexOf(permitRole.position);
				if(foundIdx > -1)
					response.roleGroup[role].position[foundIdx] = {text: permitRole.position, checked: true}
			}

			for(var pos = 0; pos < rolePosition.length; ++pos) {
				var value = response.roleGroup[role].position[pos];
				if(!value.text)
					response.roleGroup[role].position[pos] = {text: response.roleGroup[role].position[pos], checked: false}
			}
		}
	}
})

router.post('/:docId/visibility', isLoggedIn, function(req, res, next) {

	Document.findOne({docId: req.params.docId, owner: req.user})
	.exec(function(error, document) {
		if(error) return next(error);

		var permitRoles = [];

		async.forEach(req.body.permitPosition, function(position, done) {

			Role.findOne({position: position})
			.exec(function(error, role) {
				if(error) return done(error);
				permitRoles.push(role);
				done();
			})
		}, function(error) {
			if(error) return next(error);

			document.visibility = permitRoles;
			document.save(function(error) {
				if(error) next(error);
			});
			return res.redirect('/home');
		})
	})


})

module.exports = exports = router;