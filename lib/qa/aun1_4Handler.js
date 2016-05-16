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
      console.log("stakeholderReq");
      Program.Stakeholder.aggregate(
                      [
                    {
                        $match: {
                            'requirement' :{ $exists: true }
                        }
                    },
                    {
                        $group: {
                            _id: "$type",
                            stk: { $push: "$$ROOT" }
                            
                       
                       
                      }
                    }
                  ]
                  , function (err, be_stk) {


                    Program.Stakeholder.populate(be_stk, {
                         path: 'stk.ELO',
                         model: 'ELO'
                     },
                    function (err, stk) {


                    console.log("REFFFF--------stk-------->>>", stk);


                    res.render('qa/qa-aun1.4.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",
                            programname:req.query.program,
                            year : req.query.year,
                            acid : req.query.acid,
                            docs: stk,
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
});

//-------------------------------------------add aun 1.4----------------------------------------------------------------------

router.get('/add_aun1-4',isLoggedIn,function(req,res){
    console.log("[GET]add aun 1-4");
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
        res.render('qa/editqa/add_stakeholders_req.hbs', {
          layout: "qaPage",
          program : req.query.program,
          elo:elo,
          len:elo.length,
          programname:req.query.program,
          year : req.query.year,
          acid : req.query.acid,
          getyear: function (value) { return req.query.year; },
          getprogram:function (value) { return req.query.program; },
          getacid:function (value) { return req.query.acid; }
            
       
      });
    });
    
});

router.post('/add_aun1-4',isLoggedIn,function(req,res){
    console.log("[POST] add aun 1.4");
   
    console.log("sth_name: "+req.body.sth_name);
    console.log("type: "+req.body.type);
 
      var array_elo = [];
     
    for(var j=0;j< req.body.elo.length;j++){
      var temp = j;
      var keep = temp.toString

      console.log("req.body.elo.length: "+req.body.elo.length);
      if(req.body.elo.length == 24){
        array_elo.push(req.body.elo);
        break;
      }
      else{

      console.log("elo: "+req.body.elo[j]);

      array_elo.push(req.body.elo[j]);
      
      }
    }

    console.log("array_elo: "+array_elo);

    console.log("arrlen: "+req.body.arrlen);


    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepnameReq;
      var check = 0;
      var check_duplicate = 0;

      console.log('ARRAY ----req.body.count--- >'+req.body.count);

      console.log('ARRAY ----req.body.req.length--- >'+req.body.req.length);
      if(req.body.count==0 && req.body.req.length ==1){

          var obj = req.body.req;

          array.push(obj);
          
        }else{
      for(var i=0;i< strlen;i++){
        
          console.log('ARRAY ----req.body.req[i]--- >'+req.body.req[i]);
          keepnameReq = req.body.req[i];
          for(var j=i+1;j< strlen;j++){

            if(keepnameReq == req.body.req[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){

            var obj = req.body.req[i];
            
            array.push(obj);
          }
          else{

          }

          check = 0;
        }        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

    Program.Stakeholder.findOne({
          // $and: [
          //          { 'title': req.body.sth_name },
          //          { 'program': req.query.program }
          // ]
          "_id":req.query.id
      }, function(err, require) {        
        
        if (require != null) {
          console.log("EDIT-------------------->:"+require);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          console.log('ARRAY ---EDITTTT---- >'+array);
          console.log('ARRAY ---EDITTTT--array_elo-- >'+array_elo);
          
          require.title = req.body.sth_name;
          require.type= req.body.type;
          require.requirement = array;
          require.program = req.query.program;
          require.ELO = array_elo;

          require.save(function (err) {
            if(err) {
                console.error('Cant update new facility'+err);
            }
            
          });

          res.redirect('/aun/aun1-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
          

        } 
        else {
            console.log("ADD NEWWWW");
            //lhuer add course type t yung mai sed (array)
            newReq = new Program.Stakeholder();
            
            newReq.title = req.body.sth_name;
            newReq.type= req.body.type;
            newReq.requirement = array;
            newReq.program = req.query.program;
            newReq.ELO = array_elo;

            newReq.save(function(err,add_req) {
            if (err){console.log('cant add new elo: '+err);}  
            else{
              console.log("add_req"+add_req);
              console.log("Add new REQ succesful");   

              Program.findOne({'programname':req.query.program}, function(err, program) { 

                if(program!=null){


                  Program.Stakeholder.findOne({
                  $and: [
                           { 'program': req.query.program },
                           { 'title': req.body.sth_name }
                  ]
                  }, function(err, require) {


                    console.log("assesment_id: "+require.id);  

                      Program.update(
                        {"programname":req.query.program}, 
                        { $push: { "stakeholder": require.id} }
                      , function(err, add_stk_program) { 

                        if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          console.log('ADD add_stk_program TO PROGRAM SUCCESSFUL : '+add_stk_program)


                        }

                        });

                  });

                }
                else{

                  // var keepAssesmentTool = []
                  // keepAssesmentTool.push(assesment.id);
                  var managefac = new Program();
                  managefac.programname = req.query.program;
                  managefac.stakeholder.push(require.id);
                  managefac.save(function(err,manage) {
                    if (err){console.log('cant make new program Management'+err);}  
                    else{
                      console.log("ass"+manage);
                      console.log("Insert new program management succesful");  
                      res.redirect('/aun/aun1-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);                          
                    }                         
                  });



                }


                  res.redirect('/aun/aun1-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);  
              });  
                                 
            }                         
            });  
          }
          });
      }

    }); 


router.get('/del_aun1-4',isLoggedIn,function(req,res){
    console.log("Delete Aun1.3");
    console.log(req.query.id);
    //console.log(req.query.email);

    Program.Stakeholder.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete Program.Stakeholder err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);

         Program.findOne({ 'programname' :  req.query.program  }, function(err, program) {

          console.log("PROGRAMNAME---->"+program.programname);

         Program.update(
            {"programname":req.query.program}, 
            { $pull: { "stakeholder": req.query.id} }
          , function(err, delete_stk_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete delete_stk_program from PROGRAM SUCCESSFUL : '+delete_stk_program);
              res.redirect('/aun/aun1-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


            }

        });

       });
         


      }
    });
    
});


router.get('/edit_aun1-4',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun1.4");
    console.log(req.query.id);
    //console.log(req.query.email);

    Program.Stakeholder.findOne({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Edit Responsibility tool err'+err);}
      else{
         console.log("Program.Stakeholder edit --->"+results);
         console.log("results.requirement.length --->"+results.requirement.length);


         Subject.ELO.find( {
          $and: [
                 { 'eloFromTQF': { $exists: true } },
                 { 'program': req.query.program }
                ]
          },function( err, elo ) {


            console.log("elo edit --->"+elo);

         
           res.render('qa/editqa/edit_add_stakeholders_req.ejs', {
              layout: "qaPage",
              
              stk : results,
              len : results.ELO.length,
              len_req:results.requirement.length,
              program:req.query.program,
              elo:elo,
              id:req.query.id,
              programname:req.query.program,
              year : req.query.year,
              acid : req.query.acid,
              getyear: function (value) { return req.query.year; },
              getprogram:function (value) { return req.query.program; },
              getacid:function (value) { return req.query.acid; }

              
              });
        });
         

      }
    });
    
});

 

module.exports = router;