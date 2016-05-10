
var express 			= require('express');
var router  			= express.Router();
var parseString 		= require('xml2js').parseString;
var runner				= require('./runner');
var async 				= require('async');
var mongoose 			= require('mongoose');
var User                     = require('../model/user');
var Work                     = require('../model/works');
var Program                  = require('../model/program');
var Fac                      = require('../model/faculty');
var Subject                  = require('../model/subject');
var Acyear                   = require('../model/academic_year');
var Teach                    = require('../model/teaching_semester');
var TemplateWorkflow         = require('../model/TemplateWorkflow');
var Doc                      = require('../model/document/document');
var Subenroll                = require('../model/subject_enroll');
var Stdenroll                = require('../model/student_enroll');
var FacilityAndInfrastruture = require('../model/FacilityAndInfrastrutureSchema');
var AssesmentTool            = require('../model/assesmentToolSchema');
var ReferenceCurriculum      = require('../model/referenceCurriculumSchema');
var Role                     = require('../model/role');
var Responsibility           = require('../model/Responsibility');

var isLoggedIn = require('middleware/loginChecker');
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];


 

// router.get('/', function(req, res){	
// 	console.log("Get Admin");
//     console.log(current_year);
//     res.render('admin/home.hbs', {
//       layout: "adminMain",
//             user : req.user // get the user out of session and pass to template     
//         });
// });


//user section================================================================================== 
router.get('/users/:id',function(req,res){
      console.log("get api user id");
      var id = req.params.id;
      console.log(id);
      User.findById(id, function(err, result){
        if(err){console.log("api err"+err);}
        res.json(result);
      }); 

});

router.get('/users',function(req,res){
  console.log("get api users");
  User.find({}, function(err, result){
    if(err){console.log("api err"+err);}
    res.json(result);
  }); 

});


module.exports = router;
