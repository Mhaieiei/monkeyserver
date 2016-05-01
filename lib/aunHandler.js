 var express      = require('express');
 var app = express();
var router        = express.Router();
var parseString     = require('xml2js').parseString;
var runner        = require('./runner');
var async         = require('async');
var mongoose      = require('mongoose');
var User                     = require('../model/user');
var Work                     = require('../model/works');
var Program                  = require('../model/program');
var Fac                      = require('../model/faculty');
var Subject                  = require('../model/subject');
var Acyear                   = require('../model/academic_year');
var Teach                    = require('../model/teaching_semester');
var TemplateWorkflow         = require('../model/TemplateWorkflow');
var Doc                      = require('../model/document/document');
var Subenroll                = require('../model/subject_enroll');
var Stdenroll                = require('../model/student_enroll');
var FacilityAndInfrastruture = require('../model/FacilityAndInfrastrutureSchema');
var AssesmentTool            = require('../model/assesmentToolSchema');
var ReferenceCurriculum      = require('../model/referenceCurriculumSchema');
var Role                     = require('../model/role');
var Responsibility           = require('../model/Responsibility');

//aun handler
var aun1_1Control     = require('../lib/qa/aun1_1Handler');
var aun1_3Control     = require('../lib/qa/aun1_3Handler');

var isLoggedIn = require('middleware/loginChecker');

app.use('/aun1-1',aun1_1Control ); //aun1_1 
app.use('/aun1-3', aun1_3Control  ); //aun1_3

module.exports = app;