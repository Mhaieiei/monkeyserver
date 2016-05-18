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
var dialog = require('dialog');

var isLoggedIn = require('middleware/loginChecker');
var adminfact = "";

//-------------------------------------------------add ELOs-------------------------------------------------------

 router.get('/', isLoggedIn, function (req, res) {
      console.log("evaluationMethod");

      //referenceCurriculumSchema.find();

      if( req.user.local.role == 'admin'){
        adminfact = true;
       }else{
          adminfact = null;
       }
      Program.find({ 'programname': req.query.program })
        .populate('evaluation')
      .exec(function (err, docs) {



                 console.log("REFFFF---->>>", docs);
                 var index = 0;
                 res.render('qa/qa-aun11.4.hbs', {
                     //    user: req.user,      
                     layout: "qaPage",
                     programname : req.query.program,
                     year : req.query.year,
                     acid : req.query.acid,
                     admin : adminfact,
                     docs: docs,
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         // getyear: function (value) { return yearac[value]; },
                         getindex: function () { return ++index; },
                         getyear: function (value) { return req.query.year; },
                          getprogram:function (value) { return req.query.program; },
                          getacid:function (value) { return req.query.acid; }
                     }

                 });


             });


  });


  router.get('/add_aun11-4', isLoggedIn, function (req, res) {
      console.log("add 11.4");

      //referenceCurriculumSchema.find();

                 // console.log("REFFFF---->>>", docs);
                 var index = 0;
                 res.render('qa/editqa/add_aun11.4.hbs', {
                     //    user: req.user,      
                     layout: "qaPage",
                     admin : adminfact,
                     programname : req.query.program,
                     year : req.query.year,
                     acid : req.query.acid,
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         // getyear: function (value) { return yearac[value]; },
                         getindex: function () { return ++index; },
                         getyear: function (value) { return req.query.year; },
              getprogram:function (value) { return req.query.program; },
              getacid:function (value) { return req.query.acid; }
                     }

                 });




            


  });


   router.post('/add_aun11-4', isLoggedIn, function (req, res) {

      console.log("post 11.4");
      console.log("req.body.arrlen+ "+req.body.arrlen);

    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepMethod;
      var check = 0;
      var check_duplicate = 0;

      console.log('ARRAY ----req.body.count--- >'+req.body.count);

      console.log('ARRAY ----req.body.method.length--- >'+req.body.method.length);
      if(strlen==1){

          var obj = {

            'methodName': req.body.method,
            'frequency' : req.body.ftype

          }

          array.push(obj);
          
        }else{
      for(var i=0;i< strlen;i++){
        
          console.log('ARRAY ----req.body.method[i]--- >'+req.body.method[i]);
          keepMethod = req.body.method[i];
          for(var j=i+1;j< strlen;j++){

            if(keepMethod == req.body.method[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){

            var obj = {

            'methodName': req.body.method[i],
            'frequency' : req.body.ftype[i]

          }
            
            array.push(obj);
          }
          else{
            dialog.info('Have same method more than 1 in the list:)');

          }

          check = 0;
        }        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

      Program.Evaluation.findOne({
          $and: [
                   { 'stakeholder': req.body.stak_name },
                   { 'program': req.query.program }
          ]
         
      }, function(err, check_eva) {
    if (check_eva == null) {
    console.log("ADD NEWWWW");
            newEva = new Program.Evaluation();
            newEva.stakeholder = req.body.stak_name;
            newEva.EvaluationMethod = array;
            newEva.program = req.query.program;

            // var obj_eva = {"stakeholder":req.body.stak_name,"EvaluationMethod":array};
            // console.log('obj_eva----> : '+obj_eva)
            // console.log('req.query.program----> : '+req.query.program)

            newEva.save(function(err,add_eva) {
                      if (err){console.log('cant edit new program Management'+err);}  
                      else{
                            console.log('Add eva SUCCESSFUL :'+add_eva);

                            Program.Evaluation.findOne({
                                  $and: [
                                           { 'program': req.query.program },
                                           { 'stakeholder': req.body.stak_name }
                                  ]
                                 
                              }, function(err, evaluation) {


                                      Program.update(
                                           { programname: req.query.program },
                                           { $push: { evaluation: evaluation.id } }
                                        , function(err, add_eva) { 

                                            if (err){console.log('cant edit new program Management'+err);}  
                                            else{

                                              console.log('ADD TO PROGRAM SUCCESSFUL : '+add_eva)

                                              res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


                                            }

                                        }); 



                                });  

                          }
                         

                        });  
}
else{

            
            
         Program.Evaluation.findOne({
          "_id":check_eva.id
         
      }, function(err, evaluation) {        
        
          console.log("EDIT-------------------->:"+evaluation);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          console.log('ARRAY ---EDITTTT---- >'+array);
          
          
          
          evaluation.stakeholder = req.body.stak_name;
            evaluation.EvaluationMethod = array;
            evaluation.program = req.query.program;

          evaluation.save(function (err) {
            if(err) {
                console.error('Cant update new facility'+err);
            }
            res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
            
          });


          });



}
    });
      }
  
                 
         
  });


 router.get('/edit_aun11-4',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun11.4");
    console.log(req.query.id);
    //console.log(req.query.email);

    Program.Evaluation.findOne({'_id':req.query.id}
    ,function (err, eva) {

      if (err){console.log('Edit Responsibility tool err'+err);}
      else{
         console.log("Program.Eva --->"+eva);
         console.log("Program.Eva LENGTHHHH--->"+eva.EvaluationMethod.length);

           res.render('qa/editqa/edit_aun11.4.hbs', {
              layout: "qaPage",
              admin : adminfact,
              eva : eva,
              len:eva.EvaluationMethod.length,
              program:req.query.program,
              programname : req.query.program,
              year : req.query.year,
              acid : req.query.acid,
              getyear: function (value) { return req.query.year; },
              getprogram:function (value) { return req.query.program; },
              getacid:function (value) { return req.query.acid; }
             
              
              });
        
         

      }
    });
    
  });


 router.get('/del_aun11-4',isLoggedIn,function(req,res){
    console.log("Delete Aun11.4");
    console.log(req.query.id);
    //console.log(req.query.email);

    Program.Evaluation.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete Program.Stakeholder err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);

         Program.findOne({ 'programname' :  req.query.program  }, function(err, program) {

          console.log("PROGRAMNAME---->"+program.programname);

         Program.update(
            {"programname":req.query.program}, 
            { $pull: { "evaluation": req.query.id} }
          , function(err, delete_eva_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete delete_stk_program from PROGRAM SUCCESSFUL : '+delete_eva_program);
              res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


            }

        });

       });
         


      }
    });
    
});

 

module.exports = router;