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
      console.log("nationalityOfStudent");

      //referenceCurriculumSchema.find();
        
       User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program }

                            ]

                        }
                    },


                    {
                        $group: {
                            _id: { yearAttend: "$local.yearattend", nationality: "$local.nationality" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.yearAttend",
                            groupOfNationality: { $push: "$$ROOT" },
                            sunOfYear: {$sum : "$count"}
                                
                        }
                    }

      ]
        ,function (err, Nationality ) {
          console.log("REFFFF---->>>", Nationality );
          User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program },
                                

                            ]

                        }
                    },
                    {
                        $group: {
                            _id: { yearAttend: "$local.yearattend" },
                            groupOfNationality: { $push: "$$ROOT" },
                            count: { $sum: 1 }
                        }
                    }

                    

      ]
        ,function (err, student) {

      console.log("REFFFF---->>>", student );
            //referenceCurriculumSchema.find();

        User.aggregate(

                    [
                            {
                                $match: {
                                    $and: [
                                        { 'local.role': 'student' },
                                        { 'local.program': req.query.program }
                                    ]

                                }
                            },
                            { "$unwind" : "$detail"},
                            {
                                $group: {
                                    _id: { yearAttend: "$detail.academicYear" },
                                    detail: { $push: "$$ROOT" },
                                    count: { $sum: 1 }
                                }
                            }

                            

              ]
                ,function (err, student_academicYear) {

                  console.log("REFFFF--student_academicYear-->>>", student_academicYear );
                    

                    res.render('qa/qa-aun8.3.ejs', {
                        //    user: req.user,      
                        layout: "qaPage",

                        docs: Nationality,
                        student:student,
                        student_academicYear:student_academicYear,
                        programname: req.query.program,
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


module.exports = router;