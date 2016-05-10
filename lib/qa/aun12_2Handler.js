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


router.get('/', isLoggedIn, function (req, res) {
      console.log("careerDevelopment");
      console.log("Academictitle");


      
      Role.aggregate(

        [
          {
              $match: {
                  $and: [
                  { 'type': 'Supporting Staff' },
                  { 'program': req.query.program }

                  ]
              }
          },
          {
            $unwind:  "$user"    
          },

          { 
            $group : { 
              _id : {academicYear:"$academicYear"},
              
              count: { $sum: 1 }
          }

          }

          ],function (err, noOfProgarm) {

               console.log("REFFFF--Staff----noOfProgarm-->>>", noOfProgarm);

               Role.aggregate(
                  [
              {
                  $match: {
                      $and: [
                      { 'type': 'Advancement of career title' },
                      { 'program': req.query.program }

                      ]
                  }
              },
              {
          $unwind:  "$user"    
            },

                    { 
              $group : { 
                _id : {academicYear:"$academicYear" ,title:"$title"},
                
                count: { $sum: 1 }
              }

          },
          { 
              $group : { 
                _id : "$_id.academicYear",
                user: { $push: "$$ROOT" }
                
              }

          }

              
                  ],
           function (err, noOfStaffTitle) {

               console.log("REFFFF--Staff----noOfProgarm-->>>", noOfStaffTitle);

               Acyear.findOne({
                   $and: [
                          { 'program_name': req.query.program },
                          { 'academic_year': req.query.year }
                   ]
               }, function (err, programs) {
               Role.roleOfStaff.aggregate(
                               [
                           {
                               $match: {
                                   $and: [
                                       { "type": "Supporting Staff" },
                                      
                                       { "academicYear": req.query.year },
                          { "program": req.query.program }

                                   ]

                               }
                           }]
                           , function (err, staff) {
                               Program.populate(staff, {
                                   path: 'user',
                                   model: 'User'
                               },
                           function (err, user) {

                               Program.populate(user, {
                                   path: 'user.training',
                                   model: 'training'
                               }, function (err, usertraining) {
                                   Program.populate(usertraining, {
                                   path: 'user.training.academicYear',
                                   model: 'Acyear'
                               }, function (err, usertraining_acYear) {
                                   console.log("REFFFF----Faculty----Supporting Staff--usertraining->>>", usertraining_acYear);
                                   var index = 0;
                                   res.render('qa/qa-aun12.2.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",

                            docs: usertraining_acYear,
                            noOfStaffTitle:noOfStaffTitle,
                            noOfStaff:noOfProgarm,
                             programname : req.query.program,
                             year : req.query.year,
                             acid : req.query.acid,
                            helpers: {
                              inc: function (value) { return parseInt(value) + 1; },
                              getyear: function (value) { return yearac[value]; },
                              getindex: function () { return ++index; }
                          }

                         });



          });
                               });
                           });


                           });
               });
           });
           });


  });

 

module.exports = router;