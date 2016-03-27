module.exports = function(database) {

	var models = {};

	models.User = database.model('User', require('../model/user').User,'users');
	models.User.roleOfProgram = database.model('User', require('../model/user').roleOfProgram,'users');

	models.Work             = database.model('Work', require('../model/works').Work,'works');
	models.Work.Project     = database.model('Project', require('../model/works').Project,'works');
	models.Work.Public = database.model('Public', require('../model/works').Public, 'works');
	models.Work.Training = database.model('training', require('../model/works').Training, 'works');
	models.Work.CareerDevelopment = database.model('careerDevelopment', require('../model/works').CareerDevelopment, 'works');

	models.Document = database.model('Document', require('../model/document'));

	models.Faculty = database.model('Faculty', require('../model/faculty').Faculty, 'faculty');
	models.Faculty.Evaluateion = database.model('EvaluationMethod', require('../model/faculty').Evaluateion, 'faculty');
	models.Faculty.Stakeholder = database.model('stakeholder', require('../model/faculty').Stakeholder, 'faculty');

	models.Subject = database.model('Subject', require('../model/subject').Subject, 'subject');
	models.Subject.ELO = database.model('ELO', require('../model/subject').ELO, 'subject');

	models.AcademicYear = database.model('Acyear', require('../model/academic_year'));

	models.TeachingSemester = database.model('Yearstudy', require('../model/teaching_semester').TeachingSemester, 'teaching_semester');
	models.TeachingSemester.KnowledgeBlock = database.model('KnowledgeBlock', require('../model/teaching_semester').KnowledgeBlock, 'teaching_semester');
	models.TeachingSemester.Structure = database.model('structure', require('../model/teaching_semester').Structure, 'teaching_semester');

	models.TemplateWorkflow = database.model('TemplateWorkflow', require('../model/TemplateWorkflow'));
	models.StudentEnroll    = database.model('Stdenroll', require('../model/student_enroll'));
	models.SubjectEnroll = database.model('Subenroll', require('../model/subject_enroll'));
	models.AssesmentTool = database.model('assesmentToolSchema', require('../model/assesmentToolSchema'));
	models.FacilityAndInfrastruture = database.model('lecturerPlaceSchema', require('../model/FacilityAndInfrastrutureSchema'), 'lecturerPlaceSchema');

	models.ReferenceCurriculum = database.model('referenceCurriculum', require('../model/referenceCurriculumSchema').ReferenceCurriculum, 'referenceCurriculumSchema');
	models.ReferenceCurriculum.Detail = database.model('detail', require('../model/referenceCurriculumSchema').Detail, 'referenceCurriculumSchema');

	models.Responsibility = database.model('Responsibility', require('../model/Responsibility'));

	return models;
}






