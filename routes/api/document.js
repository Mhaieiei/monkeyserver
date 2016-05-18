var router = require('express').Router();
var Promise = require('bluebird');

var isLoggedin = require('middleware/loginChecker');
var Document = require('model/document/document');
var Attachment = require('model/document/attachment');
var ICDocs = require('model/document/ICDocuments');

router.get('/read/:docID', function(req, res, next) {

	var documentId = req.params.docID;
	Document.findOne({_id: documentId})
	.populate('relate2docs')
	.populate('previousVersion')
	.populate('attachments')
	.exec(function(error, document) {
		if(error)
			return next(error);

		if(!document)
			return res.status(404).json({});
		else
			return res.json(document);
	})
})

router.get('/read', function(req, res, next) {
	var query;
	if(req.query.userid)
		query = Document.findByUser(req.query.userid);
	else
		query = Document.find();

	query
	.populate('relate2docs')
	.populate('previousVersion')
	.populate('attachments')	
	.exec(function(error, document) {
		if(error)
			return next(error);

		if(!document)
			return res.json({});
		else
			return res.json(document);
	})
})

router.get('/read/:docID/allPreviousVersions', isLoggedin, function(req, res, next) {
	var documentId = req.params.docID;
	Document.findOne({docId: documentId})
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
	Document.findOne({docId: documentId})
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
	Document.findOne({docId: documentId})
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
	Document.findOneAndRemove({docId: docID}, function(error) {
		if(error) return next(error);
		res.status(200);
		res.json({status: 'ok'});
	})
})

router.post('/upload', function(req, res, next) {
	var title = req.body.title;
	var owner = req.body.owner;
	var workflowId = req.body.workflowId;
	var filepath = req.body.link;
	var docType = req.body.docType;
	var year = req.body.year;

	var subtype = docType + year;

	var metadata = {
		name: title,
		owner: owner,
		includeInWorkflow: workflowId,
		filepath: filepath,
		subtype: subtype,
		docType: docType,
		year: year
	}
	Document.findOne({name: title, owner: owner}, function(error, document) {
		var doc;
		if(document) {
			metadata.id = document.id;
			doc = createDocument(metadata);
			doc.bumpVersion();
			saveAndReturnDocument(res, doc);
		}
		else {
			doc = createDocument(metadata);
			saveAndReturnDocument(res, doc);
		}
	})
})

function createDocument(metadata) {
	if(metadata.docType == 'attachment')
		return new Attachment(metadata);
	else {
		var ICDoc = aquireTemplate(metadata.docType, metadata.year);
		return new ICDoc(metadata);
	}

}

function saveAndReturnDocument(res, doc) {
	doc.save(function(error) {
		var response = {};
		if(error) {
			response.status = error;
			res.json(response);

		}
		else{
			response = doc;
			res.json(response);
		}
	})
}

function aquireTemplate(ICDocumentType, year) {
	var Template = require('model/document/OfficialDocumentTemplate');
	try {
		var documentTemplate = new Template(ICDocumentType, year);
		return documentTemplate.compile();
	} catch(error) {
		var errorMessageRegularExpression = /discriminator/ig;
		var discriminatorError = error.message.search(errorMessageRegularExpression) > -1;
		if(!discriminatorError)
			throw error;

		return getAlreadyCompiledSchemaModel(documentTemplate.getSubtypeName());
	} 
}

function getAlreadyCompiledSchemaModel(modelName) {
	var databaseConnection = require('lib/dbclient').db();
	return databaseConnection.model(modelName);
}


module.exports = router;