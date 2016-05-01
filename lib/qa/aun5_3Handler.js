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
      console.log("assesmentTool");

      //referenceCurriculumSchema.find();


      Program.findOne({ 'programname': req.query.program }, function (err, docs) {
        if(docs !=null){
          console.log("REFFFF-DOC--->>>", docs._id);

          AssesmentTool.aggregate([
                    {
                        $match: 
                           
                                //{ 'hour': 5 }
                                { 'programname': docs.id }
                           
                        
                    },

                    { $group: { _id: "$type", assementTool: { $push: "$$ROOT" } } }
                    

          ] , function (e, result) {


              console.log("REFFFF---->>>", result);
                 var index = 0;
                 res.render('qa/qa-aun5.3.hbs', {
                     //    user: req.user,      
                     layout: "qaPage",
                     program:docs._id,
                     docs: result,
                     programname : req.query.program,
                     year : req.query.year,
                     acid : req.query.acid,
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         getyear:function(value) {return yearac[value];},
                         getindex:function() {return ++index;}}

                 });

                 });
        }
        else{

          console.log("program dose not exist");
        }
      });
                
});


//---------------------------------------------add aun 5.3--------------------------------------------------------------------
     

router.get('/add_aun5-3',isLoggedIn,function(req,res){
    console.log("[GET]add aun 5.3");

    console.log("program: "+req.query.program);
    
          
          Program.find( {'programname': { $exists: true }},function( err, program ) {

            console.log("program-------------------->:"+program);
          res.render('qa/editqa/aun5.3_add_assesment.hbs', {
            layout: "qaPage",
            program_fac:program,
            programname : req.query.program,
            year : req.query.year,
            acid: req.query.acid,            
            });

          });
    
  });




router.post('/add_aun5-3',isLoggedIn,function(req,res){
    console.log("[POST] add aun 5.3");
   
    console.log("assname: "+req.body.assname);
    console.log("TYPE: "+req.body.type);
    console.log("arrlen: "+req.body.arrlen);


    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepCourse;
      var check = 0;
      var check_duplicate = 0;
      for(var i=0;i< strlen;i++){
        if(strlen==1){
          var obj = {
            'subjectType': req.body.nameCourse,
            'followingReq' : req.body.levelCourse
          }
          array.push(obj);
          
        }else{
          keepCourse = req.body.nameCourse[i];
          for(var j=i+1;j< strlen;j++){

            if(keepCourse == req.body.nameCourse[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){
            var obj = {
              'subjectType': req.body.nameCourse[i],
              'followingReq' : req.body.levelCourse[i]
            }
            array.push(obj);
          }
          else{

          }

          check = 0;


        }
             
        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

    AssesmentTool.findOne({
          $and: [
                   { 'programname': req.query.program },
                   { 'assesmentTool': req.body.assname }
          ]
      }, function(err, assesment) {        
        
        if (assesment != null) {
          console.log("EDIT-------------------->:"+assesment);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          assesment.assesmentTool = req.body.assname;
          assesment.type = req.body.type;
          assesment.programname= req.query.program;
          assesment.subject = array;

          assesment.save(function (err) {
            if(err) {
                console.error('Cant update new facility');
            }
            
          });

          res.redirect('/aun/aun5-3?program='+req.body.program+'&year='+req.query.year+'&acid='+req.query.acid);
          

        } 
        else {
            console.log("ADD NEWWWW");
            //lhuer add course type t yung mai sed (array)
            newAssesmentTool = new AssesmentTool();
            newAssesmentTool.assesmentTool = req.body.assname;
            newAssesmentTool.type = req.body.type;
            newAssesmentTool.programname= req.query.program;
            newAssesmentTool.subject = array;

            newAssesmentTool.save(function(err,add_asses) {
            if (err){console.log('cant edit new program Management'+err);}  
            else{
              console.log("add_asses"+add_asses);
              console.log("Add new assigment succesful");  
              console.log("program------> "+req.body.program);
              Program.findOne({'programname':req.body.program}, function(err, program) { 

                if(program!=null){


                  AssesmentTool.findOne({
                  $and: [
                           { 'programname': req.query.program },
                           { 'assesmentTool': req.body.assname }
                  ]
                  }, function(err, assesment) {


                    console.log("assesment_id: "+assesment.id);  

                      Program.update(
                        {"programname":req.body.program}, 
                        { $push: { "assesmentTool": assesment.id} }
                      , function(err, add_ass_program) { 

                        if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          console.log('ADD TO PROGRAM SUCCESSFUL : '+add_ass_program)


                        }

                        });

                  });

                }
                else{

                  // var keepAssesmentTool = []
                  // keepAssesmentTool.push(assesment.id);
                  var managefac = new Program();
                  managefac.programname = req.body.program;
                  managefac.assesmentTool.push(assesment.id);
                  managefac.save(function(err,manage) {
                    if (err){console.log('cant make new program Management'+err);}  
                    else{
                      console.log("ass"+manage);
                      console.log("Insert new program management succesful");  
                      //res.redirect('/tqf25?acid='+req.body.acid+'&year='+req.body.year+'&program='+req.body.program);                          
                    }                         
                  });



                }


                  res.redirect('/aun/aun5-3?program='+req.body.program+'&year='+req.query.year+'&acid='+req.query.acid);   
              });                         
            }                         
            });  
          }
          });
      }

        
    
    
     });

router.get('/del_aun5-3',isLoggedIn,function(req,res){
    console.log("Delete Aun5.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    AssesmentTool.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete facility err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.programname-->"+req.query.programname);

         Program.findOne({ '_id' :  req.query.programname  }, function(err, program) {

          console.log("PROGRAMNAME---->"+program.programname);

         Program.update(
            {"_id":req.query.programname}, 
            { $pull: { "assesmentTool": req.query.id} }
          , function(err, delete_ass_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete from PROGRAM SUCCESSFUL : '+delete_ass_program);
              res.redirect('/aun/aun5-3?program='+req.body.program+'&year='+req.query.year+'&acid='+req.query.acid);


            }

        });

       });
         


      }
    });
    
  });

router.get('/edit_aun5-3',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun5.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    AssesmentTool.findOne({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Edit Assessment tool err'+err);}
      else{
         console.log("ass edit --->"+results);


         // Program.findOne({ '_id' : req.query.programname },function(err, program) {
          Program.find({'programname': { $exists: true }},function(err, program) {

          console.log("program edit --->"+program);

         res.render('qa/editqa/aun5.3_edit_assesment.hbs', {
            layout: "qaPage",
            program_fac:program,
            assessment : results,
            len : results.subject.length,
            program:results.programname,
            programname : req.query.program,
            year : req.query.year,
            acid : req.query.acid
            
            });
        });

         

      }
    });
    
  });


router.post('/edit_aun5-3',isLoggedIn,function(req,res){
    console.log("[POST] Edit Aun5.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    console.log("assname: "+req.body.assname);
    console.log("TYPE: "+req.body.type);
    console.log("arrlen: "+req.body.arrlen);


    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepCourse;
      var check = 0;
      var check_duplicate = 0;
      for(var i=0;i< strlen;i++){
        if(strlen==1){
          var obj = {
            'subjectType': req.body.nameCourse,
            'followingReq' : req.body.levelCourse
          }
          array.push(obj);
          
        }else{
          keepCourse = req.body.nameCourse[i];
          for(var j=i+1;j< strlen;j++){

            if(keepCourse == req.body.nameCourse[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){
            var obj = {
              'subjectType': req.body.nameCourse[i],
              'followingReq' : req.body.levelCourse[i]
            }
            array.push(obj);
          }
          else{

          }

          check = 0;


        }
             
        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

    AssesmentTool.findOne({'_id':req.query.id  }, function(err, assesment) {        
        
        if (assesment != null) {
          console.log("EDIT-------------------->:"+assesment);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          assesment.assesmentTool = req.body.assname;
          assesment.type = req.body.type;
          assesment.programname= req.query.program;
          assesment.subject = array;

          assesment.save(function (err) {
            if(err) {
                console.error('Cant update new facility');
            }
            
          });

          res.redirect('/aun/aun5-3?program='+req.body.program+'&year='+req.query.year+'&acid='+req.query.acid);

          

        } 
        else {
            console.log("ADD NEWWWW");
            
          }
          });
      }
    
  });


module.exports = router;