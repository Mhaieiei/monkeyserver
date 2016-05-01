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
      console.log("FacilityAndInfrastrutureSchema");  
      var acyear = req.query.acid;   
      FacilityAndInfrastruture.find({ 'programAndAcYear': req.query.acid }, function (err, docs) {
          if(err) console.log("aun10_1 query err"+err);
          console.log("REFFFF---->>>", docs);
          res.render('qa/qa-aun10.1.hbs', {
            //    user: req.user,      
            layout: "qaPage",
            docs: docs,
            programname : req.query.program,
            year : req.query.year,
            acid : req.query.acid,
            helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getacyear: function () { return acyear; }
            } 
        });
    });            

  });

//---------------------------edit aun 10.1 ----------------------------------------------------------------------
router.get('/addaun10_1',isLoggedIn,function(req,res){
    console.log("[GET]Edit AUN 10.1");    
    console.log(req.query.acid);
   
    res.render('qa/editqa/aun10.1_add_facilities.hbs', {
            //    user: req.user,      
            layout: "qaPage",
            programname : req.query.program,
            year : req.query.year,
            acid : req.query.acid
        }); 
    
});

router.post('/addaun10_1',isLoggedIn,function(req,res){
    console.log("[POST]Edit AUN 10.1");    
    console.log(req.body.acid);
    console.log(req.body.roomno);
    console.log(req.body.floor);
    console.log(req.body.building);
    console.log(req.body.noofseat);
   
    FacilityAndInfrastruture.findOne({ 
      $and: [
                 { 'programAndAcYear' :  req.body.acid  },
                 { 'roomNo' : req.body.roomno }
               ]
      
    }, function (err, docs) {
          if(err) console.log("aun10_1 query err"+err);
          var facility = new FacilityAndInfrastruture();
            facility.programAndAcYear = req.body.acid;
            facility.roomNo = req.body.roomno;
            facility.floor = req.body.floor;
            facility.building = req.body.building;
            facility.numberOfSeat = req.body.noofseat;
           facility.save(function(err,manage) {
            if (err){console.log('cant make new facility'+err);}  
            else{
              console.log(manage);
              console.log("Insert new facility succesful");  
              res.redirect('/aun/aun10-1?acid='+req.body.acid+'&program='+req.body.program+'&year='+req.body.year);                          
            }                         
         });  
         
    });    
    
  });

 router.get('/editaun10_1',isLoggedIn,function(req,res){
    var index =req.query.id;
    console.log("[Get]Edit AUN 10.1");
    return FacilityAndInfrastruture.findById(index, function( err, facility ) {
        if( !err ) {
        console.log(facility);
            res.render('qa/editqa/aun10_1edit.hbs', {
              layout: "qaPage",
              programname : req.body.program,
              year : req.body.year,
              acid : req.body.acid,
              facility: facility ,

            });
        } else {
            return console.log( "query facility err"+err );
          }
      }); 
  });
router.post('/editaun10_1',isLoggedIn,function(req,res){
    console.log("[Post] Edit AUN10.1");
    return FacilityAndInfrastruture.findById(req.body.facilityid, function( err, facility ) {
        if( err ) {console.log('Query facility err'+err);}
        console.log(facility);
        facility.editFacility(req,res);          
      }); 
  });

  router.get('/delaun10_1',isLoggedIn,function(req,res){
    console.log("Delete Aun10.1");
    console.log(req.query.id);
    //console.log(req.query.email);

    FacilityAndInfrastruture.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('Delete facility err'+err);}
          else console.log(results);
          }
       );
    res.redirect('/aun/aun10-1?acid='+req.query.acid+'&program='+req.query.program+'&year='+req.query.year);

    
    
  });





 

module.exports = router;