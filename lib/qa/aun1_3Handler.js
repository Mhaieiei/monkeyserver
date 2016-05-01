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
    console.log("mapELOAndKnowledge");
    Program.find({ 'programname': req.query.program })
         .populate('Responsibility')

         .exec(function (err, docs) {
             Program.populate(docs, {
                 path: 'Responsibility.ELO',
                 model: 'ELO'
             },
                function (err, subs) {


                    console.log("REFFFF---->>>", subs);

                    res.render('qa/qa-aun1.3.hbs', {
                        //    user: req.user,      
                        layout: "qaPage",

                        docs: subs,
                        program:req.query.program,
                        helpers: {
                            inc: function (value) { return parseInt(value) + 1; },
                            getyear: function (value) { return yearac[value]; },
                            getindex: function () { return ++index; }
                        }
                    });


                });


         });

});

//-------------------------------------------add aun 1.3----------------------------------------------------------------------
router.get('/add_aun1-3',isLoggedIn,function(req,res){
    console.log("[GET]add aun 1-3");
    console.log("[GET] ELO");

    
    console.log("program: "+req.query.program);
    
      Subject.ELO.find( {
      $and: [
             { 'eloFromTQF': { $exists: true } },
             { 'program': req.query.program }
            ]
      },function( err, elo ) { 

        console.log("ELO-------------------->:"+elo);
        console.log("ELO-------------------->:"+elo.length);
        res.render('qa/editqa/elos_mapped.hbs', {
          layout: "qaPage",
          program : req.query.program,
          elo:elo,
          len:elo.length
            
       
      });
    });
    
});

router.post('/add_aun1-3',isLoggedIn,function(req,res){
    console.log("[POST] add aun 1.3");
   
    console.log("category: "+req.body.category);
    console.log("description: "+req.body.description);
 
      var array = [];
     
    for(var j=0;j< req.body.elo_tqf2.length;j++){
      var temp = j;
      var keep = temp.toString

      console.log("req.body.elo_tqf2.length: "+req.body.elo_tqf2.length);
      if(req.body.elo_tqf2.length == 24){
        array.push(req.body.elo_tqf2);
        break;
      }
      else{

      console.log("elo: "+req.body.elo_tqf2[j]);

      array.push(req.body.elo_tqf2[j]);
      
      }
    }

    Responsibility.findOne({
          // $and: [
          //          { 'program': req.query.program },
          //          { 'category': req.body.category }
          // ]
          "_id":req.query.id
      }, function(err, respon) {        
        
        if (respon != null) {
          console.log("EDIT-------------------->:"+respon);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          respon.category = req.body.category;
          respon.description = req.body.description;
          respon.program= req.query.program;
          respon.ELO = array;

          respon.save(function (err) {
            if(err) {
                console.error('Cant update new facility');
            }
            
          });

          res.redirect('/aun/aun1-3?program='+req.query.program);
          

        } 
        else {
            console.log("ADD NEWWWW");
            //lhuer add course type t yung mai sed (array)
            newResponsibility = new Responsibility();
            newResponsibility.category = req.body.category;
            newResponsibility.description = req.body.description;
            newResponsibility.program= req.query.program;
            newResponsibility.ELO = array;

            newResponsibility.save(function(err,add_respon) {
            if (err){console.log('cant edit new program Management'+err);}  
            else{
              console.log("add_newResponsibility"+add_respon);
              console.log("Add new assigment succesful");  
              console.log("program------> "+req.query.program);
              Program.findOne({'programname':req.query.program}, function(err, program) { 

                if(program!=null){


                  Responsibility.findOne({
                  $and: [
                           { 'program': req.query.program },
                           { 'category': req.body.category }
                  ]
                  }, function(err, respon) {


                    console.log("assesment_id: "+respon.id);  

                      Program.update(
                        {"programname":req.query.program}, 
                        { $push: { "Responsibility": respon.id} }
                      , function(err, add_respon_program) { 

                        if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          console.log('ADD TO PROGRAM SUCCESSFUL : '+add_respon_program)


                        }

                        });

                  });

                }
                else{

                  // var keepAssesmentTool = []
                  // keepAssesmentTool.push(assesment.id);
                  var managefac = new Program();
                  managefac.programname = req.query.program;
                  managefac.Responsibility.push(respon.id);
                  managefac.save(function(err,manage) {
                    if (err){console.log('cant make new program Management'+err);}  
                    else{
                      console.log("ass"+manage);
                      console.log("Insert new program management succesful");  
                      res.redirect('/aun/aun1-3?program='+req.query.program);                          
                    }                         
                  });



                }


                  res.redirect('/aun/aun1-3?program='+req.query.program);   
              });                         
            }                         
            });  
          }
          });




    }); 

router.get('/del_aun1-3',isLoggedIn,function(req,res){
    console.log("Delete Aun1.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    Responsibility.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete Responsibility err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);

         Program.findOne({ 'programname' :  req.query.program  }, function(err, program) {

          console.log("PROGRAMNAME---->"+program.programname);

         Program.update(
            {"programname":req.query.program}, 
            { $pull: { "Responsibility": req.query.id} }
          , function(err, delete_res_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete from PROGRAM SUCCESSFUL : '+delete_res_program);
              res.redirect('/aun/aun1-3?program='+program.programname);


            }

        });

       });
         


      }
    });
    
  });


router.get('/edit_aun1-3',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun1.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    Responsibility.findOne({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Edit Responsibility tool err'+err);}
      else{
         console.log("Responsibility edit --->"+results);


         Subject.ELO.find( {
          $and: [
                 { 'eloFromTQF': { $exists: true } },
                 { 'program': req.query.program }
                ]
          },function( err, elo ) {


            console.log("elo edit --->"+elo);

         
           res.render('qa/editqa/edit_elos_mapped.ejs', {
              layout: "qaPage",
              
              respon : results,
              len : results.ELO.length,
              program:req.query.program,
              elo:elo,
              id:req.query.id
              
              });
        });
         

      }
    });
    
  });

 

module.exports = router;