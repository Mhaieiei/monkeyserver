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
      console.log("knowledgeAndSkill");

      //referenceCurriculumSchema.find();

      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              console.log(programs._id);
              //referenceCurriculumSchema.find();
              Teach.find({
                  $and: [
                    { 'ac_id': programs._id },
                  { 'plan': { $exists: true } }
                  ]
              })
                .populate('plan')
                .populate('subject.subcode')
                .exec(function (err, docs) {
                    Teach.populate(docs, {
                        path: 'subject.subcode.ELO.ELO',
                        model: 'Subject'
                    },
                    function (err, subs) {


                        console.log("REFFFF---->>>", subs);

                        res.render('qa/qa-aun3.3.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",
                            docs: subs,
                            programname : req.query.program,
                            year : req.query.year,
                            acid : req.query.acid,
                        });

                        //, function (err, docs) {


                    });
                });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });
  });

 

 

module.exports = router;