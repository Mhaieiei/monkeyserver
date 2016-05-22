'use strict';
var inherit = require('inherit');
var DocumentTemplate = require('./DocumentTemplate');

/**
 * This module creates subtype document by year.
 * It use module {@link template} then place stricter naming rules.
 * Basically, it appends year to subtype name creating a new type.
 * The field .docId will also be replaced with the following format. <subtype name><4-digits year><4-digits incremental number>
 * 4-digit incremental number will have leading zeros ex. 0001, 0012, 0123, and 1234.
 * @author Apipol Niyomsak <makemek101@hotmail.com>
 *  
 * @param {string} subtypeName - Name of a subtype document. The name will be uppercased when saved to a database. It must not contains blank spaces or digits.
 * @param {string|number} year - A year contains only poitive integers.
 * @param {string} additionalFields - Additional fields to be added to the inherited schema.
 * @return {object} inheritedSchema - A schema inherited from {@link document}.
 *
 * @throws error if year is negative or is not a number.
 * @throws error if subtype name contain blank spaces in-between or contains digits.
 * @throws error if the subtype name is already exists in mongoose.
 */

var OfficialDocumentTemplate = {
	__constructor: function(subtypeName, year, additionalFields) {
		validateParameters(subtypeName, year);
		var subtypeWithYear = subtypeName.toUpperCase().concat(year);
		this.__base(subtypeWithYear, additionalFields);
	},

	compile: function() {
		compileDocumentIdBeforeSave(this.getSchema());
		return this.__base();
	}
}

function compileDocumentIdBeforeSave(schema) {
	schema.pre('save', function(next) {
		this.docId = this.subtype.concat(fillLeadingZeros(this.docNum, 4));
		next();
	});

}

function includeIdAfterFilename(filename, id) {
	var hasFileExtension = filename.search(/\./) > -1;
	if(hasFileExtension)
		return filename.replace('.', '_' + id + '.');
	else
		return filename.concat('_' + id);
}

function validateParameters(subtypeName, year) {
	if(!isValidYear(year))
		throw new Error('Invalid year got' + year);
	if(!isValidSubtype(subtypeName))
		throw new Error('Invalid sub type name got' + subtypeName);
}

function isValidSubtype(subtypeName) {
	if(!subtypeName || typeof(subtypeName) === 'number')
		return false;
	subtypeName = subtypeName.trim();

	var containSpaces = subtypeName.search(/ /) > -1;
	var containDigits = subtypeName.search(/[0-9]/) > -1;
	if(containSpaces || containDigits)
		return false;
	return true;
}

function isValidYear(year) {
	if(parseInt(year) != NaN && year > 0)
		return true;
	else
		return false;
}

function fillLeadingZeros(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

module.exports = exports = inherit(DocumentTemplate, OfficialDocumentTemplate);
