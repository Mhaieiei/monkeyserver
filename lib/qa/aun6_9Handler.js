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
      console.log("termination of lecturer");

      //referenceCurriculumSchema.find();

      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              Role.roleOfStaff.find({
                  $and: [
                        { "position": "Faculty Member" },
                        { "academicYear": req.query.year },
                                        { "program": req.query.program }
                  ]
              })
                .populate('user')
                .exec(function (err, lec) {

                  console.log("REFFFF---->>>", lec);

                    Role.roleOfStaff.find({
                        $and: [
                            { "position": "Visiting Member" },
                            { "academicYear": req.query.year },
                                        { "program": req.query.program }
                        ]
                    })
                .populate('user')
                .exec(function (err, visiting) {


                    console.log("REFFFF---->>>", visiting);
                    var index = 0;
                    res.render('qa/qa-aun6.9.hbs', {
                        //    user: req.user,      
                        layout: "qaPage",

                        docs: lec,
                        visiting:visiting,
                        programname : req.query.program,
                        year : req.query.year,
                        acid : req.query.acid,
                        helpers: {
                            getRetired: function (value) { return 60-parseInt(value); },
                            getAcYearOfRetired: function (value) { return parseInt(req.query.year) + (60 - parseInt(value)); },
                            getindex: function () { return ++index; },
                            getTerminate: function (value) { return parseInt(value) - parseInt(req.query.year); }
                        }

                    });
                });

                });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });

  });

 

 

module.exports = router;