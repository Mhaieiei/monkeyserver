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
      console.log("no of student status");

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
                            _id: { studentDetail: "$detail.status", academicYear: "$detail.academicYear" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.academicYear",
                            root: { $push: "$$ROOT" },
                            sumOfYear: { $sum: "$count" }

                        }
                    }

            ]
        , function (err, studentStatus) {


            //referenceCurriculumSchema.find();




            console.log("REFFFF---->>>", studentStatus);

            res.render('qa/qa-aun14.1.ejs', {
               //    user: req.user,      
               layout: "qaPage",
               programname : req.query.program,
               year : req.query.year,
               acid : req.query.acid,
               docs: studentStatus,
               helpers: {
                   inc: function (value) { return parseInt(value) + 1; },
                   getyear: function (value) { return yearac[value]; },
                   getindex: function () { return ++index; }
               }
            });






        });

  });


module.exports = router;