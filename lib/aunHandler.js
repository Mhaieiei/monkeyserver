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
var aun1_4Control     = require('../lib/qa/aun1_4Handler');
var aun2_1Control     = require('../lib/qa/aun2_1Handler');
var aun3_3Control     = require('../lib/qa/aun3_3Handler');
var aun5_3Control     = require('../lib/qa/aun5_3Handler');
var aun6_1Control     = require('../lib/qa/aun6_1Handler');
var aun6_2Control     = require('../lib/qa/aun6_2Handler');
var aun11_1Control    = require('../lib/qa/aun11_1Handler');


var isLoggedIn = require('middleware/loginChecker');

app.use('/aun1-1',aun1_1Control ); //aun1_1 
app.use('/aun1-3', aun1_3Control  ); //aun1_3
app.use('/aun1-4', aun1_4Control  ); //aun1_4
app.use('/aun2-1', aun2_1Control  ); //aun2_1
app.use('/aun3-3', aun3_3Control  ); //aun3_3
app.use('/aun5-3', aun5_3Control  ); //aun5_3
app.use('/aun6-1', aun6_1Control  ); //aun6_1
app.use('/aun6-2', aun6_2Control  ); //aun6_2
app.use('/aun11-1', aun11_1Control  ); //aun11_1



module.exports = app;