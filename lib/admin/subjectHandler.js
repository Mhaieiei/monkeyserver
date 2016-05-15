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
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];

 router.get('/',isLoggedIn,function(req,res){
    console.log('Admin Get Subject select');
    return Fac.find({}, function( err, faculty ) {
        if( !err ) {
      console.log(faculty);
            res.render("admin/faculty/subject/subjectselect.hbs", {
              layout: "adminPage",
              user : req.user,
              faculty: faculty,
              year : years,
              helpers: {
              set: function (value) { index = value; },
              get: function(){return index;},
            
            }
            });
        } else {
            return console.log( err+"mhaieiei" );
          }
      });
    
    
});

router.post('/',isLoggedIn,function(req,res){
    console.log("Admin Post Subject");
    console.log(req.body.sub_programs);
    console.log(req.body.years);
    Acyear.findOne({ 
      $and: [
                 { 'program_name' :  req.body.sub_programs  },
                 { 'academic_year' : req.body.years }
               ]
      
    }, function(err, ac) {
        
        if (err){
      console.log("Error ...1");
    }
        // check to see if theres already a user with that email
        if (ac!= null) {
      console.log("There have table(s) to show");
      console.log(ac);
      res.redirect('/admin/subjects/showsubject?acid='+ac.id+'&program='+ac.program_name+'&acyear='+ac.academic_year);
      // res.render('admin/faculty/searchprogram.hbs',{
      //  layout: "adminMain",
      //  user: req.user,
      //  program : req.body.sub_programs,
      //  acid : ac.id,
      //  year : req.body.years
        
      //  });
      // });
        } else {
           console.log("There not have table to show,make new");
           var acYear        = new Acyear();

            // set the user's local credentials
      acYear.academic_year = req.body.years;
      acYear.program_name = req.body.sub_programs;
      
            // save the acyear
            acYear.save(function(err,acc) {
              if (err){console.log('mhaiiiiiii');}
                else{
                 nametemp = acc.id;
                 console.log("Insert already"+ nametemp); 
                 res.redirect('/admin/subjects/showsubject?acid='+acc.id+'&program='+acc.program_name+'&acyear='+acc.academic_year);                 
                }
            });
          
         }
        });
  
});

router.get('/showsubject',isLoggedIn,function(req,res){
      console.log("Admin get showsubjects");
      console.log(req.query.acid);
      console.log(req.query.program);
      console.log(req.query.acyear);
      var acyear,semester,yearlevel;

      Teach
      .find({'ac_id': req.query.acid})
      .populate('subject.subcode')
      .exec(function(err, docs) {
        if(err) console.log(err);

        Teach.populate(docs, {
          path: 'subject.subcode.sub_lecter',
          model: 'User'
        },
        function(err, subs) {
          if(err) console.log(err);
            // This object should now be populated accordingly.
          console.log(subs);
            res.render("admin/faculty/subject/subjecthome.hbs", {
                layout: "adminPage",
                user : req.user,
                teachsemes: subs,
                year : years,
                acid : req.query.acid,
                program:req.query.program,
                helpers: {  
                setac: function(ac){acyear = ac;},
                setsemes: function (semes) {semester = semes; },
                setyear: function(year){yearlevel = year;},
                getac: function () {return acyear; },           
                getsemes: function () {return semester; },
                getyear: function(){return yearlevel;},
              
              }
             
               });
        });
      });

});
  
 //delete subject information.
router.get('/delsub',isLoggedIn,function(req,res){
    console.log("Delete Subject");
    console.log(req.query.id);
    //console.log(req.query.email);

    Subject.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('mhaiiiiiii');}
          else console.log(results);
          }
       );
    res.redirect('/admin/subjects');
});
    //edit education information.
router.get('/editsubject',isLoggedIn,function(req,res){
    var index =req.query.id;
    console.log("Admin Edit subject");
    console.log(req.query.id);

    return Subject.findOne({'sub_code' : req.query.id }, function( err, subject ) {
        if( !err ) {
      console.log(subject);
            res.render('admin/faculty/subject/editsubject.hbs', {
              layout: "adminPage",
        user : req.user,
              subject: subject,
              helpers: {
              inc: function (value) { return parseInt(value) + 1; }
            }
            });
        } else {
            return console.log( err+"mhaieiei" );
          }
      }); 
});
  
router.post('/editsubject',isLoggedIn,function(req,res){
    console.log("Admin Edit subject");
    //console.log(req.query.id);
    //user : req.user   
    Subject.findOne({'sub_code' :  req.body.sub_code },
      function(err, sub) {
        if (err){ 
          console.log("Upload Failed!");
          return done(err);}        
        if (sub){
          console.log(sub);
          sub.editSubject(req, res)           
        }

      });
});

module.exports = router;