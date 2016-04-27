/**
 * IC's subtype documents module.
 * @module model/document/department/DocumentFactory
 * @author Apipol Niyomsak <makemek101@hotmail.com>
 * 
 * This module contains a predefined IC's document templates types wrapped in JSON.
 * They are all created by {@link template} which generates a mongoose schema with auto increment 'docnum' field.
 * Documents in IC are divided into three categories.
 * Abbrivations are used as subtype name to be recorded and queried.
 * 
 * 1. General Management 1
 * ------------------------------------
 * | Type              | Abbriviation |
 * |-------------------|:------------:|
 * | Archive           |      AA      |
 * | Human Resources   |      AB      |
 * | Quality Assurance |      AC      |
 * | Parcel            |      AD      |
 * | IT/KM             |      AE      |
 * ------------------------------------
 *
 * 2. General Management 2
 * -----------------------------------------
 * | Type                   | Abbriviation |
 * |------------------------|:------------:|
 * | Plan & Risk Management |      BA      |
 * | Accounting             |      BB      |
 * | Research               |      BC      |
 * | Academic Management    |      BD      |
 * -----------------------------------------
 *  
 * 3. Academic
 * ------------------------------------------
 * | Type                    | Abbriviation |
 * |-------------------------|:------------:|
 * | Academic Administration |      CA      |
 * | Student Affairs         |      CB      |
 * ------------------------------------------
 */
var Template = require('./templateByYear');

module.exports = function(year) {
	var ICDocuments = {
		/* General Management 1 */
		archive: aquireTemplate('AA', year),
		humanResource: aquireTemplate('AB', year),
		qualityAssurance: aquireTemplate('AC', year),
		parcel: aquireTemplate('AD', year),
		IT_KM: aquireTemplate('AE', year),

	/* General Management 2 */
	riskManagement: departmentDocTemplate('BA', year),
	accounting: departmentDocTemplate('BB', year),
	research: departmentDocTemplate('BC', year),
	academicManagement: departmentDocTemplate('BD', year),


		/* Academic */
		academicAdministration: aquireTemplate('CA', year),
		studentAffairs: aquireTemplate('CB', year)
	}

	return ICDocuments;
}

function aquireTemplate(ICDocumentType, year) {
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