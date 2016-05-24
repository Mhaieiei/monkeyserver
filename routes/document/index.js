'use strict';

var router = require('express').Router();
var isLoggedIn = require('middleware/loginChecker');

router.get('/:docId/visibility', isLoggedIn, function(req, res, next) {
	res.render('document/visibility.hbs', {layout: 'homePage'})
})

module.exports = exports = router;