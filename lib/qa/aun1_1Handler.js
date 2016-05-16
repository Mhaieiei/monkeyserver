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

router.get('/',isLoggedIn,function(req,res){
    console.log("[GET] get ELOs");
    Subject.ELO.find( {
      $and: [
                   { 'eloFromTQF': { $exists: true } },
                   { 'program': req.query.program }
          ]
    },function( err, elo ) {

      console.log("[GET] get ELOs------->"+elo);


      res.render('qa/qa-elo.hbs', {
          layout: "qaPage",
          programname: req.query.program,
          year : req.query.year,
          acid : req.query.acid,
          elo:elo,
          helpers: {
              inc: function (value) { return parseInt(value) + 1; },     
              getyear: function (value) { return req.query.year; },
              getprogram:function (value) { return req.query.program; },
              getacid:function (value) { return req.query.acid; }                 
          } 
      });
    });
});

router.get('/addelos',isLoggedIn,function(req,res){

    console.log("[GET] Add ELOs");
    res.render('qa/editqa/add_elos.hbs', {
        layout: "qaPage",
        programname: req.query.program,
        year : req.query.year,
        acid : req.query.acid,
        getyear: function (value) { return req.query.year; },
        getprogram:function (value) { return req.query.program; },
        getacid:function (value) { return req.query.acid; }
    });            
            
    
});
router.post('/addelos',isLoggedIn,function(req,res){
    console.log("[POST] Add ELOs");    
   
    console.log("elos_no: "+req.body.elos_no);
    console.log("elos_des: "+req.body.elos_des);
    console.log("arrlen: "+req.body.arrlen);


    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepnameELO;
      var check = 0;
      var check_duplicate = 0;
      for(var i=0;i< strlen;i++){
        if(strlen==1){

          var obj = req.body.nameELO;

          array.push(obj);
          
        }else{
          console.log('ARRAY ----req.body.nameELO[i]--- >'+req.body.nameELO[i]);
          keepnameELO = req.body.nameELO[i];
          for(var j=i+1;j< strlen;j++){

            if(keepnameELO == req.body.nameELO[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){

            var obj = req.body.nameELO[i];
            
            array.push(obj);
          }
          else{

          }

          check = 0;
        }        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

    Subject.ELO.findOne({
          $and: [
                   { 'number': req.body.elos_no },
                   { 'program': req.query.program }
          ]
          // "_id":req.query.id
      }, function(err, elo) {        
        
        if (elo != null) {
          console.log("EDIT-------------------->:"+elo);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          
          elo.description = req.body.elos_des;
          elo.number= req.body.elos_no;
          elo.eloFromTQF = array;
          elo.program = req.query.program;

          elo.save(function (err) {
            if(err) {
                console.error('Cant update new facility');
            }
            
          });

          res.redirect('/aun/aun1-1?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
          

        } 
        else {
            console.log("ADD NEWWWW");
            //lhuer add course type t yung mai sed (array)
            newElo = new Subject.ELO();
            
            newElo.description = req.body.elos_des;
            newElo.number= req.body.elos_no;
            newElo.eloFromTQF = array;
            newElo.program = req.query.program;

            newElo.save(function(err,add_elo) {
            if (err){console.log('cant add new elo: '+err);}  
            else{
              console.log("add_elo"+add_elo);
              console.log("Add new ELO succesful");     
              res.redirect('/aun/aun1-1?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);                   
            }                         
            });  
          }
          });
      }
});

router.get('/del_elo',isLoggedIn,function(req,res){
    console.log("Delete elo in elo schema.. not for another schema that have this");
    console.log(req.query.id);
    //console.log(req.query.email);

    Subject.ELO.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete facility err'+err);}
      else{
         console.log("RESULT: "+results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);


        
         Responsibility.update(
            {}, 
            { $pull: { ELO: req.query.id} },
            {multi: true}
          , function(err, delete_elo_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete elo from Responsibility SUCCESSFUL : '+delete_elo_program);
              // res.redirect('/aun5-3?program='+program.programname);


              Program.Stakeholder.update(
                {"program":req.query.program}, 
                { $pull: { "ELO": req.query.id} },
                {multi: true}
              , function(err, delete_stk_program) { 

                if (err){console.log('cant edit new program Management'+err);}  
                else{

                  console.log('delete delete_stk_program from PROGRAM SUCCESSFUL : '+delete_stk_program);
                  Subject.update(
                                {},{ $pull: { 'ELO' : { 'ELO' : req.query.id } } },{multi: true}
                                
                              , function(err, add_detail_student) { 

                                if (err){console.log('cant edit new STATUS'+err);}  
                                else{
                                  console.log('DELETE ELO from SUBJECT SUCCESSFUL : '+add_detail_student)
                                  
                                  

                                  }


                              });


                }

            });
              res.redirect('/aun/aun1-1?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


            }

        });
      }
    });
    
});


router.get('/edit_elo',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun5.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    Subject.ELO.findOne({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Edit Assessment tool err'+err);}
      else{
         console.log("ELO edit --->"+results);


         // Program.findOne({ '_id' : req.query.programname },function(err, program) {
        //   Program.find({'programname': { $exists: true }},function(err, program) {

        //   console.log("program edit --->"+program);

         res.render('qa/editqa/edit_elos.hbs', {
            layout: "qaPage",
            
            elo : results,
            len : results.eloFromTQF.length,
            programname :results.program,
            year : req.query.year,
            acid : req.query.acid,
            id:req.query.id,
            getyear: function (value) { return req.query.year; },
            getprogram:function (value) { return req.query.program; },
            getacid:function (value) { return req.query.acid; }
            
            });
        // });

         

      }
    });
    
});
 

module.exports = router;