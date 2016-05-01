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
      console.log("listOfLecturer");

      //referenceCurriculumSchema.find();
      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              console.log("REFFFF--programs._id-->>>", programs._id);
              

                  Role.roleOfStaff.aggregate(
                      [
                    {
                        $match: {
                            $and: [
                                { "type": "Academic Staff" },
                                { "academicYear": req.query.year },
                                        { "program": req.query.program }

                            ]

                        }
                    },
                    {
                        $unwind:  "$user"    
                    },
                    { 
                      $group : { 
                        _id : "$position" ,
                        user: { $push: "$user" }
                      }

                  }

                    ]
                  , function (err, staff) {
                    console.log("REFFFF----Faculty-----staff->>>", staff);
                      Program.populate(staff, {
                          path: 'user',
                          model: 'User'
                      },
                    function (err, user) {
                      console.log("REFFFF----Faculty-----user->>>", user);
                        Program.populate(user, {
                            path: 'user.publicResearch',
                            model: 'Public'
                        },function (err, userPublic) {
                            console.log("REFFFF----Faculty----Academic Staff--userPublic->>>", userPublic);

                          

                             
                                
                                res.render('qa/qa-aun6.1.ejs', {
                                   //    user: req.user,      
                                   layout: "qaPage",
                                   programname : req.query.program,
                                   year : req.query.year,
                                   acid : req.query.acid,
                                   docs: userPublic,
                                   helpers: {
                                       inc: function (value) { return parseInt(value) + 1; },
                                       getyear: function (value) { return yearac[value]; },
                                       getindex: function () { return ++index; }
                                   }
                                });


                   
                    

                
                    });
                  });
              });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "aun6_1 error");
          }
      });

  });
 

 

module.exports = router;