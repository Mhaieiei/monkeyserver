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
	acadeicService: departmentDocTemplate('BD'),

	/* Academic */
	academicAdministration: departmentDocTemplate('CA'),
	studentAffairs: departmentDocTemplate('CB')
}