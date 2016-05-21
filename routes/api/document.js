var router = require('express').Router();
var path = require('path');
var fileStream = require('fs');

var isLoggedin = require('middleware/loginChecker');
var Document = require('model/document/document');
var Attachment = require('model/document/attachment');
var ICDocs = require('model/document/ICDocuments');

var fileStream = require('fs');
var path = require('path');
var async = require('async')

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
	var recipient = req.body.recipient;
	var form = req.body.form;
	var attachment = req.body.attachment;
	
	var targetFilePath = writeTextToFile('uploads/document/form', form.displayName + '.html', form.HTMLContent, next);
	
	var formAsDocument = createFormDocument(form, recipient, targetFilePath);
	formAsDocument.done();
	var attachmentAsDocument = [];

	async.forEach(attachment, function(_attachment, done) {
		createAttachmentDocument(_attachment, recipient, _attachment.filepath, function(returnAttachment) {
			if(!returnAttachment) {
				done(); // handle receive docId but not found in the database
			} else {
				returnAttachment.done();
				formAsDocument.addAttachment(returnAttachment);
				attachmentAsDocument.push(returnAttachment);
				returnAttachment.save(done);
			}
		})	
	}, function(error) {
		if(error) {
			res.status(500);
			return res.json(error);
		}

		formAsDocument.save(function(error) {
			if(error) {
				res.status(500);
				return res.json(error);
			}
			return res.json({form: formAsDocument, attachment: attachmentAsDocument})
		})
	})
})

router.post('/uploadNewVersion/:docId', function(req, res, next) {
	Document.findOne({docId: req.params.docId})
	.exec(function(error, document) {
		handleError(error);

		if(!document) {
			res.status(404);
			return res.json({message: req.params.docId + ' not found'})
		}

		var oldDocument = document._id;
		var documentNewVersion = Document.clone(document);

		delete documentNewVersion.includeInWorkflow;
		documentNewVersion.is_auto_generate = true;

		documentNewVersion.previousVersion = oldDocument;
		documentNewVersion.bumpVersion();

		req.pipe(req.busboy);
		req.busboy.on("file", onFileAttachEvent('uploads/document', function(error, path2File) {
			handleError(error);
			documentNewVersion.filepath = path2File;
			documentNewVersion.save(responseDocumentAsJson);
		}));

		function responseDocumentAsJson(error) {
			handleError(error);
			return res.json(documentNewVersion);	
		}
	})
})

function handleError(error) {
	if(!error)
		return;

	res.status(500);
	return res.json(error);
}

function onFileAttachEvent(serverPathDirectory2save, onFileSavedEvent) {
	return function(fieldname, file, filename) {
		try {
	    	fileStream.mkdirSync(serverPathDirectory2save);
		} catch(error) {}

	    fstream = fileStream.createWriteStream(path.join(serverPathDirectory2save, filename));
	    file.pipe(fstream);
	    fstream.on('close', function(error) {
	    	var path2File = path.join(serverPathDirectory2save, filename);
	    	onFileSavedEvent(error, path2File);
	    });
	}
}

function writeTextToFile(targetDirectory, filename, content, errorHandler) {
	var targetDirectoryAbosolute = path.resolve(targetDirectory);
	if(!fileStream.existsSync(targetDirectoryAbosolute))
        fileStream.mkdirSync(targetDirectoryAbosolute);

    var targetFile = path.join(targetDirectoryAbosolute, filename);
	fileStream.writeFileSync(targetFile, content);

	return path.join(targetDirectory, filename);
}

function createFormDocument(formParameters, owner, filepath) {
	var today = new Date();
	var Form = aquireTemplate('FORM', today.getFullYear());
	var form = new Form({
		owner: owner,
		name: formParameters.displayName,
		includeInWorkflow: formParameters.executionId,
		filepath: filepath,
		is_auto_generate: true,
		author: 'Monkey System'
	});

	return form
}

function createAttachmentDocument(attachmentParameters, owner, filepath, onReturnAttachment) {
	if(attachmentParameters.docId) {
		Attachment.findOne({docId: attachmentParameters.docId})
		.exec(onReturnAttachment)
	}
	else {
		var attachment = new Attachment({
			name: attachmentParameters.displayName,
			includeInWorkflow: attachmentParameters.executionId,
			filepath: attachmentParameters.filepath,
			owner: owner,
			author: 'Monkey System'
		});
		onReturnAttachment(attachment);
	}
}

function createDocument(metadata) {
	if(metadata.docType == 'attachment')
		return new Attachment(metadata);
	else {
		var ICDoc = aquireTemplate(metadata.docType, metadata.year);
		return new ICDoc(metadata);
	}

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