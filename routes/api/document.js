var router = require('express').Router();
var Promise = require('bluebird');

var isLoggedin = require('middleware/loginChecker');
var Document = require('model/document/document');

router.get('/read/:docID', isLoggedin, function(req, res, next) {
	var documentId = req.params.docID;
	Document.findOne({id: documentId})
	.exec(function(error, document) {
		if(error) return next(error);
		
		res.json(document);
	})
})

router.get('/read/:docID/allPreviousVersions', isLoggedin, function(req, res, next) {
	var documentId = req.params.docID;
	Document.findOne({id: documentId})
	.exec(function(error, document) {
		if(error) return next(error);
		if(document) {
			populatePreviousVersionField(document).then(function() {
				res.json(document);
			})	
		}
		else
			res.json(document);
	})

	function populatePreviousVersionField(node) {
	  return Document.populate(node, { path: 'previousVersion' }).then(function(node) {
	    return node.previousVersion ? populatePreviousVersionField(node.previousVersion) : node;Promise.fulfill(node);
	  });
	}
})

router.get('/ref/:docID', isLoggedin, function(req, res, next) {
	var documentId = req.params.docID;
	Document.findOne({id: documentId})
	.populate('relate2docs')
	.exec(function(error, document) {
		if(error) return next(error);

		if(!document)
			res.json([]);
		else
			res.json(document.getRelatedDocuments());
	})
})

router.get('/attach/:docID', isLoggedin, function(req, res, next) {
	var documentId = req.params.docID;
	Document.findOne({id: documentId})
	.populate('attachments')
	.exec(function(error, document) {
		if(error) return next(error);

		if(!document)
			res.json([]);
		else
			res.json(document.getAttachments())
	})
	
})

router.get('/attach', isLoggedin, function(req, res, next) {
	var user = req.user;
	Document.findByUser(user)
	.populate('attachments')
	.select({'attachments': 1})
	.exec(function(error, documents) {
		if(error) return next(error);
		res.json(documents);
	})
})

router.get('/delete/:docID', isLoggedin, function(req, res, next) {
	var docID = req.params.docID;
	Document.findOneAndRemove({id: docID}, function(error) {
		if(error) return next(error);
		res.status(200);
		res.json({status: 'ok'});
	})
})

module.exports = router;