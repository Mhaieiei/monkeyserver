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

      //referenceCurriculumSchema.find();
      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {

              console.log("REFFFF---->>>", programs.id);
              Work.CareerDevelopment.aggregate([
                    {
                        $match: {
                            $and: [
                                { 'activity': { $exists: true } },
                                //{ 'hour': 5 }
                                { 'academicYear': programs.id }
                            ]
                        }
                    },

                    { $group: { _id: "$user", careerDevelopment: { $push: "$$ROOT" } } }


              ], function (e, result) {
                  //console.log("REFFFF--activity-->>>", result);

                  User.populate(result, {
                      path: '_id',
                      model: 'User'
                  },
                         function (err, subs) {



                             console.log("REFFFF--USERR----activity-->>>", subs);

                            

                            Role.aggregate(

                            [
                              {
                                  $match: {
                                      $and: [
                                      { 'type': 'Academic Staff' },
                                      { 'program': req.query.program },
                                      {'position': 'Faculty Member'}

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

                              ],
                         function (err, noOfProgarm) {

                             console.log("REFFFF--USERR----noOfProgarm-->>>", noOfProgarm);

                             Role.aggregate(
                                [
                            {
                                $match: {
                                    $and: [
                                    { 'type': 'Academic title' },
                                    { 'program': req.query.program },
                                    {'role':'Faculty Member'}

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
                         function (err, noOfAcademicTitle) {

                             console.log("REFFFF--USERR----noOfAcademicTitle-->>>", noOfAcademicTitle);
                             
                                     console.log("REFFFF--programs._id-->>>", programs._id);
                                     
                             Role.roleOfStaff.aggregate(
                                             [
                                         {
                                             $match: {
                                                 $and: [
                                                     { "type": "Academic Staff" },
                                                    {"position": "Faculty Member"},
                                                     { "academicYear": req.query.year },
                                        { "program": req.query.program }
                                                    

                                                 ]

                                             }
                                         }]
                                         , function (err, staff) {
                                          // console.log("REFFFF----Faculty----Academic Staff>>>", staff);

                                             Program.populate(staff, {
                                                 path: 'user',
                                                 model: 'User'
                                             },function (err, user) {

                                          // console.log("REFFFF----Faculty----Academic Staff---pop-user>>>", user);

                                          Program.populate(user, {
                                                 path: 'user.training',
                                                 model: 'training'
                                             }, function (err, usertraining) {

                                              // console.log("REFFFF----Faculty----Academic Staff--usertraining->>>", usertraining);
                                                 Program.populate(usertraining, {
                                                 path: 'user.training.academicYear',
                                                 model: 'Acyear'
                                             }, function (err, usertraining_acYear) {
                                                 console.log("REFFFF----Faculty----Academic Staff--usertraining---academicYear>>>", usertraining_acYear);



                        
                                                 
                                                             

                                                             res.render('qa/qa-aun12.1.ejs', {
                                                                //    user: req.user,      
                                                                layout: "qaPage",
                                                                userrole : req.user.local.role,
                                                                training: usertraining_acYear,
                                                                academicTitle:noOfAcademicTitle,
                                                                noOfStaff:noOfProgarm,
                                                                careerDevelopment:subs,
                                                                academicYear:req.query.year,
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
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });



  });
 

module.exports = router;