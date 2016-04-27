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
var departmentDocTemplate = require('./template');

module.exports = {
	/* General Management 1 */
	archive: departmentDocTemplate('AA'),
	humanResource: departmentDocTemplate('AB'),
	qualityAssurance: departmentDocTemplate('AC'),
	parcel: departmentDocTemplate('AD'),
	IT_KM: departmentDocTemplate('AE'),

	/* General Management 2 */
	riskManagement: departmentDocTemplate('BA'),
	accounting: departmentDocTemplate('BB'),
	research: departmentDocTemplate('BC'),
	academicManagement: departmentDocTemplate('BD'),

	/* Academic */
	academicAdministration: departmentDocTemplate('CA'),
	studentAffairs: departmentDocTemplate('CB')
}