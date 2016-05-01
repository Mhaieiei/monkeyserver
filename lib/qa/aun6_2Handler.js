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
      console.log("tab 3.11 rankingOfstaff");

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
                                        { "type": "Academic title" },
                                        
                                        { "academicYear": req.query.year },
                                        { "program": req.query.program }

                                    ]
                        }
                    },
                    {
                        $unwind:  "$user"    
                    },
                    {
                        $group: {
                            _id: {role:"$role", type: "$title" },
                            user: { $push: "$$ROOT" },
                            count: { $sum: 1 }
                       
                       
                      }
                    },
                    {
                        $group: {
                            _id: "$_id.role",
                            groupOftype: { $push: "$$ROOT" },
                            sunOfYear: { $sum: "$count" }

                        }
                    }

                    
                    

                  ]
                  , function (err, staff) {
                   
                      console.log("REFFFF-staff1--->>>", staff);
                      
                  // docs[i].groupOftype[j].user[k].user
                          User.populate(staff, {
                      path: 'groupOftype.user.user',
                      model: 'User'
                  },
                         function (err, pop_user) {

                          console.log("REFFFF-pop user--->>>", pop_user);

                                Role.roleOfStaff.aggregate(
                                [
                            {
                                $match: {
                               /* $and: [
                                {*/
                                  // $or: [
                                 //    { "type": "Academic Staff" },
                                 //    { 'type': "Student" }
                                   

                                  // ]
                                  "type": "Academic Staff" 
                            }

                            },
                            

                            {
                                $unwind:  "$user"    
                            },
                                {
                                    $group: {
                                        _id: {academicYear:"$academicYear", type: "$position" },
                                        count: { $sum: 1 }
                                   
                                   
                                }
                                },
                                {
                                    $group: {
                                        _id: "$_id.academicYear",
                                        groupOftype: { $push: "$$ROOT" },
                                        sunOfYear: { $sum: "$count" }

                                    }
                                }

                            
                                ]
                            , function (err, user) {

                              console.log("REFFFF---user--->>>", user);

                              Role.roleOfStaff.aggregate(
                                [
                            {
                                $match: {
                               /* $and: [
                                {*/
                                  // $or: [
                                 //    { "type": "Academic Staff" },
                                 //    { 'type': "Student" }
                                   

                                  // ]
                                  "type": "Student" 
                            }

                            },
                            

                            {
                                $unwind:  "$user"    
                            },
                                {
                                    $group: {
                                        _id: {academicYear:"$academicYear", type: "$position" },
                                        count: { $sum: 1 }
                                   
                                   
                                }
                                },
                                {
                                    $group: {
                                        _id: "$_id.academicYear",
                                        groupOftype: { $push: "$$ROOT" },
                                        sunOfYear: { $sum: "$count" }

                                    }
                                }

                            
                                ]
                            , function (err, student) {

                                console.log("REFFFF---student--->>>", student);
                        res.render('qa/qa-aun6.2.ejs', {
                           //    user: req.user,      
                           layout: "qaPage",

                           docs: pop_user,
                           roleOfuser:user,
                           student:student,
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
                     // });

                    });
              });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "aun6_2err");
          }
      });

    });

 

 

module.exports = router;