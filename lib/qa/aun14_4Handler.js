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
      console.log("14-4");

      //referenceCurriculumSchema.find();

      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {

        console.log("programs.id: "+programs._id);

        Role.roleOfStaff.aggregate(

              [
                      {
                          $match: {
                              $and: [{
                                  
                                  $or: [
                                  {"type": "Academic Staff"},
                              {"position": "Graduate"}
                              ]},
                              

                              ]

                          }
                      },

                      {
                        $unwind:  "$user"    
                      },
                      { 
                        $group : { 
                           _id : {academicYear:"$academicYear",type:"$type", position:"$position"} ,

                          user: { $push: "$user" },
                          count:{$sum:1}
                        }

                    },
                      {
                          $group: {
                              _id: "$_id.academicYear",
                              root: { $push: "$$ROOT" },
                              // sumOfYear: { $sum: "$count" }

                          }
                      }

              ]
          , function (err, staffAndPublication) {


              //referenceCurriculumSchema.find();

              User.populate(staffAndPublication, {
                 path: 'root.user',    
             model: 'User'   
        },function(err, user) {


          User.populate(user, {
                 path: 'root.user.publicResearch',   
             model: 'Public'   
        },function(err, public) {

          User.populate(public, {
                 path: 'root.user.publicResearch.acyear',    
             model: 'Acyear'   
        },function(err, academicYear) {


              console.log("REFFFF--academic staff publication in 2014-->>>", academicYear);

              res.render('qa/qa-aun14.4.ejs', {
                 //    user: req.user,      
                 layout: "qaPage",
                 userrole : req.user.local.role,
                 docs: staffAndPublication,
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


module.exports = router;