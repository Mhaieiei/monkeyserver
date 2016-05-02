 var express      = require('express');
 var app = express();
// var router        = express.Router();
// var parseString     = require('xml2js').parseString;
// var runner        = require('./runner');
// var async         = require('async');
// var mongoose      = require('mongoose');
// var User                     = require('../model/user');
// var Work                     = require('../model/works');
// var Program                  = require('../model/program');
// var Fac                      = require('../model/faculty');
// var Subject                  = require('../model/subject');
// var Acyear                   = require('../model/academic_year');
// var Teach                    = require('../model/teaching_semester');
// var TemplateWorkflow         = require('../model/TemplateWorkflow');
// var Doc                      = require('../model/document/document');
// var Subenroll                = require('../model/subject_enroll');
// var Stdenroll                = require('../model/student_enroll');
// var FacilityAndInfrastruture = require('../model/FacilityAndInfrastrutureSchema');
// var AssesmentTool            = require('../model/assesmentToolSchema');
// var ReferenceCurriculum      = require('../model/referenceCurriculumSchema');
// var Role                     = require('../model/role');
// var Responsibility           = require('../model/Responsibility');

//aun handler
var aun1_1Control     = require('../lib/qa/aun1_1Handler');
var aun1_3Control     = require('../lib/qa/aun1_3Handler');
var aun1_4Control     = require('../lib/qa/aun1_4Handler');
var aun2_1Control     = require('../lib/qa/aun2_1Handler');
var aun3_3Control     = require('../lib/qa/aun3_3Handler');
var aun5_3Control     = require('../lib/qa/aun5_3Handler');
var aun6_1Control     = require('../lib/qa/aun6_1Handler');
var aun6_2Control     = require('../lib/qa/aun6_2Handler');
var aun6_9Control     = require('../lib/qa/aun6_9Handler');
var aun7Control       = require('../lib/qa/aun7Handler');
var aun8_3Control     = require('../lib/qa/aun8_3Handler');
var aun10_1Control     = require('../lib/qa/aun10_1Handler');
var aun11_1Control    = require('../lib/qa/aun11_1Handler');
var aun11_4Control    = require('../lib/qa/aun11_4Handler');
var aun12_1Control    = require('../lib/qa/aun12_1Handler');
var aun12_2Control    = require('../lib/qa/aun12_2Handler');
var aun13_2Control    = require('../lib/qa/aun13_2Handler');
var aun14_1Control    = require('../lib/qa/aun14_1Handler');
var aun14_4Control    = require('../lib/qa/aun14_4Handler');




app.use('/aun1-1',aun1_1Control ); //aun1_1 
app.use('/aun1-3', aun1_3Control  ); //aun1_3
app.use('/aun1-4', aun1_4Control  ); //aun1_4
app.use('/aun2-1', aun2_1Control  ); //aun2_1
app.use('/aun3-3', aun3_3Control  ); //aun3_3
app.use('/aun5-3', aun5_3Control  ); //aun5_3
app.use('/aun6-1', aun6_1Control  ); //aun6_1
app.use('/aun6-2', aun6_2Control  ); //aun6_2
app.use('/aun6-9', aun6_9Control  ); //aun6_2
app.use('/aun7', aun7Control  ); //aun7
app.use('/aun8-3', aun8_3Control  ); //aun8_3
app.use('/aun10-1', aun10_1Control  ); //aun10_1
app.use('/aun11-1', aun11_1Control  ); //aun11_1
app.use('/aun11-4', aun11_4Control  ); //aun11_4
app.use('/aun12-1', aun12_1Control  ); //aun12_1
app.use('/aun12-2', aun12_2Control  ); //aun12_2
app.use('/aun13-2', aun13_2Control  ); //aun13_2
app.use('/aun14-1', aun14_1Control  ); //aun14_1
app.use('/aun14-4', aun14_4Control  ); //aun14_4




module.exports = app;