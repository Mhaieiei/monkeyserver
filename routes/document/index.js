'use strict';

var router = require('express').Router();
var Document = require('model/document/document');
var Role = require('model/role');
var isLoggedIn = require('middleware/loginChecker');
var async = require('async');

router.get('/:docId/visibility', isLoggedIn, function(req, res, next) {
	var response = {layout: 'homePage'};
	response.docId = req.params.docId;

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
		if(error) next(error);

		response.roleGroup = roleGroup;
		console.log(roleGroup);
		res.render('document/visibility.hbs', response);
	})

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