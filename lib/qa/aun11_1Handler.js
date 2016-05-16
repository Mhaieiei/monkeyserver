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
      console.log("developmentCommittee");

      console.log("req.query.program: "+req.query.program);
      console.log("req.query.year: "+req.query.year);
      console.log("req.query.acid: "+req.query.acid);

      //referenceCurriculumSchema.find();
      Acyear.findOne(
        { 
          $or: [ 
          {
              $and: [
                       { 'program_name': req.query.program },
                       { 'academic_year': req.query.year }
              ]
          }, 
          { '_id': req.query.acid } 
          ]
    }

      , function (err, programs) {
          if (programs != null) {
      Role.roleOfProgram.find({
          $and:[{

              "type": "Development Committee"},
                { "academicYear": programs._id}
          ]
      })
        .populate('user')
        .exec(function (err, docs) {

            // console.log("REFFFF---->>>", docs);
            var index = 0;
            res.render('qa/qa-aun11.1.hbs', {
                //    user: req.user,      
                layout: "qaPage",
                year:req.query.year,
                programname:req.query.program,
                acid : req.query.acid,
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
          } else {
              //res.redirect('/fachome');

              Acyear.findOne({ '_id': req.query.acid }, function (err, programs) {
          
                Role.roleOfProgram.find({
                    $and:[{

                        "type": "Development Committee"},
                          { "academicYear": programs._id}
                    ]
                })
                  .populate('user')
                  .exec(function (err, docs) {

                      // console.log("REFFFF---->>>", docs);
                      var index = 0;
                      res.render('qa/qa-aun11.1.hbs', {
                          //    user: req.user,      
                          layout: "qaPage",
                          year:req.query.year,
                          programname:req.query.program,
                          acid : req.query.acid,
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
           
          }
      });

  });
 
 //-------------------------------------add aun 11.1------------------------------------------------------------------------------------

router.get('/add_aun11-1',isLoggedIn,function(req,res){
    console.log("[GET]add aun 11-1");
    console.log("[GET] User [Academic staff] ");

    
    console.log("program: "+req.query.program);
    console.log("year: "+req.query.year);
    
      Role.find( {
      $and: [
             { 'type': "Academic Staff" },
             { 'academicYear': req.query.year },
             { 'program': req.query.program }
            ]
      })
      .populate('user')
      .exec(function (err, docs) {

       
        res.render('qa/editqa/aun11.1_adddevcom.hbs', {
          layout: "qaPage",
          program : req.query.program,
          year:req.query.year,
          acid : req.query.acid,
          user:docs,
          len:docs.length,
          getyear: function (value) { return req.query.year; },
              getprogram:function (value) { return req.query.program; },
              getacid:function (value) { return req.query.acid; }
          

         
            
       
      });
    });
    
});

router.post('/add_aun11-1',isLoggedIn,function(req,res){
    console.log("[POST] add aun 11.1");
     console.log("req.query.acid-----> : "+req.query.acid); 
    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepName;
      var keepSurname;
      var check = 0;
      var check_duplicate = 0;
      for(var i=0;i< strlen;i++){
        if(strlen!=1){ 
          keepName = req.body.name[i];
          keepSurname = req.body.surname[i];
          for(var j=i+1;j< strlen;j++){

            if(keepName == req.body.name[j] && keepSurname == req.body.surname[j]){             
              check_duplicate = 1;
            }
          }  
        
        }
      } 

      if(check_duplicate == 0 ){

        
        Acyear.findOne({
            $and: [
                     { 'academic_year': req.query.year },
                     { 'program_name': req.query.program }
            ]
        }, function(err, acyear) {

         
          var keepPosition = [];
          var keepName = [];
          var keepSurname = [];
          var keepDev = {};
          var array_k = [];
          for(var i=0;i< strlen;i++){

            if(strlen==1){
              keepPosition.push(req.body.position);
              keepName.push(req.body.name);
              keepSurname.push(req.body.surname);
              
            }else{
              keepPosition.push(req.body.position[i]);
              keepName.push(req.body.name[i]);
              keepSurname.push(req.body.surname[i]);

              
                
            }

            console.log("keepPosition--ARRAY---i : "+keepPosition[i]);  
            console.log("keepSurname---ARRAY--i: "+keepSurname[i]);  
            console.log("keepName----ARRAY------i: "+keepName[i]);  
            console.log("keepPosition--LENGTH---i : "+keepPosition.length);  
            console.log("keepSurname---LENGTH--i: "+keepSurname.length);  
            console.log("keepName----LENGTH------i: "+keepName.length); 

            keepDev = {'position':keepPosition[i],'name':keepName[i],'surname':keepSurname[i]}

            array_k.push(keepDev);


            }

           console.log("array_k---->: "+array_k); 

            array_k.forEach(function(k_dev) {
              
            console.log("acyear.id-------------->: "+acyear.id); 

              Role.roleOfProgram.findOne({
                    $and: [
                             { 'type': "Development Committee" },
                             { 'academicYear': acyear.id },
                             { 'position': k_dev["position"] }
                    ]
              }, function(err, role) {        
          
                  if (role != null) {

                    

                    User.findOne({ 
                            $and:[

                            {'local.name' :  k_dev["name"] },
                            {'local.surname':k_dev["surname"]}
                            ]

                          }, function(err, user) {

                          console.log("USER-------->"+user);

                          if(user!=null){

                              console.log("user_id: "+user.id);  

                                Role.roleOfProgram.update({"_id":role.id},
                                  { $push: { "user": user.id} }
                                , function(add_ass_program) { 

                                  

                                    console.log('ADD TO ROLE OF PROGRAM SUCCESSFUL : '+add_ass_program);
                                    User.update({"_id":user.id},
                                      { $push: { "roleOfProgram": role.id} }
                                      , function(err, user) {

                                        if (err){console.log('cant edit new program Management'+err);}  
                                        else{

                                          console.log('ADD ROLE OF PROGRAM TO user SUCCESSFUL : '+user);

                                        }

                                      });

                                  
                            });

                          }
                          else{

                            console.log('This user does not exist in this program');
                          }
                          
                          

                        });    
                    

                  } 

                  else {

                   
                      console.log("ADD NEWWWW");
                      //lhuer add course type t yung mai sed (array)
                      newRole = new Role.roleOfProgram();
                      newRole.type = "Development Committee";
                      newRole.academicYear = acyear.id;
                      newRole.position= k_dev["position"];

                      console.log("keepPosition: "+k_dev["position"]); 

                      var array = [];

                      newRole.save(function(err,add_asses) {
                      if (err){console.log('cant edit new program Management'+err);}  
                      else{
                        console.log("Add new succesful: "+add_asses);
                                            
                        console.log("keepName: "+k_dev["name"]);  
                        console.log("keepSurname: "+k_dev["surname"]);  
                        
                          User.findOne({ 
                            $and:[

                            {'local.name' :  k_dev["name"] },
                            {'local.surname':k_dev["surname"]}
                            ]

                          }, function(err, user) {

                          console.log("USER-------->"+user);

                          if(user!=null){

                              console.log("user_id: "+user.id);  

                                Role.roleOfProgram.update({
                                  $and: [
                                   { 'type': "Development Committee" },
                                   { 'academicYear': acyear.id },
                                   { 'position': k_dev["position"] }
                                  ]},
                                  { $push: { "user": user.id} },function(err, add_ass_program){ 

                                  if (err){console.log('cant edit new program Management'+err);}  
                                  else{

                                    console.log('ADD TO ROLE OF PROGRAM SUCCESSFUL : '+add_ass_program);

                                    Role.roleOfProgram.findOne({
                                      $and: [
                                       { 'type': "Development Committee" },
                                       { 'academicYear': acyear.id },
                                       { 'position': k_dev["position"] }
                                      ]}
                                      
                                    , function(err, role) {

                                      console.log('role: '+role);

                                      User.update({ 
                                        $and:[

                                        {'local.name' :  k_dev["name"] },
                                        {'local.surname':k_dev["surname"]}
                                        ]

                                      },
                                      { $push: { "roleOfProgram": role.id} }
                                      , function(err, user) {

                                        if (err){console.log('cant edit new program Management'+err);}  
                                        else{

                                          console.log('ADD ROLE OF PROGRAM TO user SUCCESSFUL : '+user);

                                        }

                                      });

                                    });
                                  }
                            });

                          }
                          else{

                            console.log('This user does not exist in this program');
                          }

                        });                         
                      }
                      
                        
                                        
                    });  
                      
                    }
                });
            
         
          }); //for each

          res.redirect('/aun/aun11-1?program='+req.query.program+"&year="+req.query.year+"&acid="+req.query.acid);
        });
      }

  }); 

//--------------------------------------------Not finished?----------------------------------------

router.get('/del_aun11-1',isLoggedIn,function(req,res){
    console.log("Delete Aun11.1");
    console.log(req.query.id);
    //console.log(req.query.email);

    Role.roleOfProgram.remove({ '_id' : req.query.id },function(err, results) {
      if (err){console.log('Delete Role.roleOfProgram err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);

         

         User.update(
            {}, 
            { $pull: { roleOfProgram: req.query.id} },
            {multi: true}
          , function(err, delete_elo_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete ROLE OF PROGRAM FROM USER SUCCESSFUL : '+delete_elo_program);
              // res.redirect('/aun5-3?program='+program.programname);


              
              res.redirect('/aun/aun11-1?program='+req.query.program+"&year="+req.query.year+"&acid="+req.query.acid);


            }

        });

         


      }
    });
    
  });



router.get('/edit_aun11-1',isLoggedIn,function(req,res){
    console.log("[GET] Edit Aun11.1");
    console.log(req.query.id);
    //console.log(req.query.email);

    Role.roleOfProgram.findOne({'_id':req.query.id})
    .populate('user')
      .exec(function (err, role) {

      if (err){console.log('Edit Responsibility tool err'+err);}
      else{
         console.log("Role.roleOfProgram --->"+role);

           res.render('qa/editqa/edit_aun11-1.hbs', {
              layout: "qaPage",
              
              role : role,
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

router.post('/edit_aun11-1',isLoggedIn,function(req,res){
    console.log("[POST] Edit Aun11.1");
    console.log(req.query.id);
    //console.log(req.query.email);

    console.log("arrlen: "+req.body.arrlen);


    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepName;
      var keepSurname;
      var check = 0;
      var check_duplicate = 0;
      for(var i=0;i< strlen;i++){
        if(strlen!=1){ 
          keepName = req.body.name[i];
          keepSurname = req.body.surname[i];
          for(var j=i+1;j< strlen;j++){

            if(keepName == req.body.name[j] && keepSurname == req.body.surname[j]){             
              check_duplicate = 1;
            }
          }  
        
        }
      } 

      if(check_duplicate == 0 ){

        var array_k = [];
        var keepName =[];
        var keepSurname= [];
        var keepDev = {};
          for(var i=0;i< strlen;i++){

            if(strlen==1){
              
              keepName.push(req.body.name);
              keepSurname.push(req.body.surname);
              
            }else{
              
              keepName.push(req.body.name[i]);
              keepSurname.push(req.body.surname[i]);

              
                
            }

            
            console.log("keepSurname---ARRAY--i: "+keepSurname[i]);  
            console.log("keepName----ARRAY------i: "+keepName[i]);  
       
            console.log("keepSurname---LENGTH--i: "+keepSurname.length);  
            console.log("keepName----LENGTH------i: "+keepName.length); 

            keepDev = {'name':keepName[i],'surname':keepSurname[i]}

            array_k.push(keepDev);


            }

    

         Role.roleOfProgram.update(
            {'_id': req.query.id}, 
            { $unset: { 'user': "" }}
            ,function(err, results) {
      if (err){console.log('Delete Role.roleOfProgram err'+err);}
      else{
         console.log(results);

         console.log("PROGRAMNAME--req.query.program-->"+req.query.program);

         

         User.update(
            {}, 
            { $pull: { roleOfProgram: req.query.id} },
            {multi: true}
          , function(err, delete_elo_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
            else{

              console.log('delete ROLE OF PROGRAM FROM USER SUCCESSFUL : '+delete_elo_program);
              // res.redirect('/aun5-3?program='+program.programname);
              array_k.forEach(function(k_dev) {
              Role.roleOfProgram.findOne({
                    '_id': req.query.id
              }, function(err, role) {        
          
                  
                    User.findOne({ 
                            $and:[

                            {'local.name' :  k_dev["name"] },
                            {'local.surname':k_dev["surname"]}
                            ]

                          }, function(err, user) {

                          console.log("USER-------->"+user);

                          if(user!=null){

                              console.log("user_id: "+user.id);  

                                Role.roleOfProgram.update({"_id":role.id},
                                  { 
                                    "position":req.body.position,
                                    $push: { "user": user.id} 
                                  }
                                , function(add_ass_program) { 

                                  

                                    console.log('ADD TO ROLE OF PROGRAM SUCCESSFUL : '+add_ass_program);
                                    User.update({"_id":user.id},
                                      { $push: { "roleOfProgram": role.id} }
                                      , function(err, user) {

                                        if (err){console.log('cant edit new program Management'+err);}  
                                        else{

                                          console.log('ADD ROLE OF PROGRAM TO user SUCCESSFUL : '+user);

                                        }

                                      });

                                  
                            });

                          }
                          else{

                            console.log('This user does not exist in this program');
                          }
                          
                          

                        });    
                    

                   });
              });


              
              res.redirect('/aun/aun11-1?program='+req.query.program+"&year="+req.query.year+"&acid="+req.query.acid);


            }

        });

         


      }
    });



         


         
         

      }
   
  
    
  });


 

module.exports = router;