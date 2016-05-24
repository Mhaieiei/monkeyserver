'use strict';

var router = require('express').Router();
var Document = require('model/document/document');
var Role = require('model/role');
var isLoggedIn = require('middleware/loginChecker');
var async = require('async');

router.get('/:docId/visibility', isLoggedIn, function(req, res, next) {
	var response = {layout: 'homePage'};
	response.docId = req.params.docId;

	var showRoleField = {objectId: "$_id", type: "$type"};
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

		console.log(roleGroup);
		res.render('document/visibility.hbs', response);
	})

})

module.exports = exports = router;