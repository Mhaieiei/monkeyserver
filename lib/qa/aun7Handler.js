 var express      = require('express');
var router        = express.Router();
var parseString     = require('xml2js').parseString;
//var runner        = require('./runner');
var async         = require('async');
var mongoose      = require('mongoose');
var User                     = require('../../model/user');
var Work                     = require('../../model/works');
var Program                  = require('../../model/program');
var Fac                      = require('../../model/faculty');
var Subject                  = require('../../model/subject');
var Acyear                   = require('../../model/academic_year');
var Teach                    = require('../../model/teaching_semester');
var TemplateWorkflow         = require('../../model/TemplateWorkflow');
var Doc                      = require('../../model/document/document');
var Subenroll                = require('../../model/subject_enroll');
var Stdenroll                = require('../../model/student_enroll');
var FacilityAndInfrastruture = require('../../model/FacilityAndInfrastrutureSchema');
var AssesmentTool            = require('../../model/assesmentToolSchema');
var ReferenceCurriculum      = require('../../model/referenceCurriculumSchema');
var Role                     = require('../../model/role');
var Responsibility           = require('../../model/Responsibility');

var isLoggedIn = require('middleware/loginChecker');


//-------------------------------------------------add ELOs-------------------------------------------------------

router.get('/', isLoggedIn, function (req, res) {
      console.log("listOfSupportStaff");

      //referenceCurriculumSchema.find();


      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              Role.roleOfStaff.find({
                  $and:[{

                      "type": "Supporting Staff"},
                        { "academicYear": req.query.year },
                                        { "program": req.query.program }
                  ]
              })
                .populate('user')
                .exec(function (err, docs) {


                    console.log("REFFFF---->>>", docs);

          var index = 0;
          var count = 0;
          res.render('qa/qa-aun7.hbs', {
              //    user: req.user,      
              layout: "qaPage",
              programname : req.query.program,
              year : req.query.year,
              acid : req.query.acid,
              docs: docs,
              helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getyear: function (value) { return yearac[value]; },
                  getindex: function () { return ++index; },
                  getcount: function () { return ++count; },
                  getRetired: function (value) { return 60 - parseInt(value); },
                  getAcYearOfRetired: function (value) { return parseInt(req.query.year) + (60 - parseInt(value)); },
                  getTerminate: function (value) { return parseInt(value) - parseInt(req.query.year); }
          
              }

          });


                });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });

  });
 

module.exports = router;