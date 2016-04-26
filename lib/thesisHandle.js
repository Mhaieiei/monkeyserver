
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


router.get('/', function(req, res){	
	 console.log("Get Thesis Information");
    console.log(req.query.name);
    User
    .findOne({'local.username': req.query.name})
    .populate('advisingProject')
    .exec(function(err, docs) {
      if(err) console.log(err);
      User.populate(docs, {
        path: 'advisingProject.user.iduser',    
         model: 'User'   
      },
      function(err, works) {
        if(err) console.log("cant find thesis of user"+err);
          // This object should now be populated accordingly.
        console.log(works);

          res.render("profile/works/thesisinfo.ejs", {
              //layout: "profileAdstudent",
              user : req.query.name,
              Userinfo: works,
              year : years,
              acid : req.query.id,
           
             });

      });
    });   
});

 //add thesis
router.get('/addthesis',isLoggedIn,function(req,res){
    console.log("Add Thesis");
    console.log(req.query.user);
     Fac.find({},function(err,fac){
          if(err) console.log('Cant query fac'+err);
            res.render('profile/works/addthesis.hbs', {
            layout: "homePage",
            username : req.query.user, // get the user out of session and pass to template
            faculty : fac     
          });                        
        });
});   

    
 
router.post('/addthesis',isLoggedIn,function(req,res){
    console.log("Posttt Add thesis");
    console.log(req.body.name);
    console.log(req.body.username);
    console.log(req.body.nameuser);
    console.log(req.body.roleuser);
    
    console.log(req.body.program)
    console.log(req.body.acyear);
    
    console.log(req.body.arrlen);
        
    var strlen = req.body.arrlen; 
    var userarr = [];
      var array = [];    
      //advisee
      for(var i=0;i< strlen;i++){
        if(strlen==1){
          var userobj = {
            'iduser': req.body.nameuser,
            'typeuser' : req.body.roleuser
          }
          if(req.body.roleuser == 'advisee'){
            var obj ={ 
                    '_id' : req.body.nameuser,
                    'education': [],
                    'local': {
                    'username': req.body.nameuser,
              'name': req.body.nameuser,
              'program' : "",
              'role': "student"},
              }                   
          }else{
            var obj = { 
                    '_id' : req.body.nameuser,
                    'education': [],
                    'local': {
                    'username': req.body.nameuser,
              'name': req.body.nameuser,
              'program' : "",
              'role': "staff"}, 
              }                 
          }
        }else{
          var userobj = {
            'iduser': req.body.nameuser[i],
            'typeuser' : req.body.roleuser[i]
          }
          if(req.body.roleuser[i] == 'advisee'){
            var obj ={ 
                    '_id' : req.body.nameuser[i],
                    'education': [],
                    'local': {
                    'username': req.body.nameuser[i],
              'name': req.body.nameuser[i],
              'program' : "",
              'role': "student"},
              }                   
          }else{
            var obj = { 
                    '_id' : req.body.nameuser[i],
                    'education': [],
                    'local': {
                    'username': req.body.nameuser[i],
              'name': req.body.nameuser[i],
              'program' : "",
              'role': "staff"}, 
              }                 
          }
        }
        userarr.push(userobj);        
        array.push(obj);
      }
       
    console.log(userarr);
    console.log(array); 
      Acyear.findOne({ 
      $and: [
                 { 'program_name' :  req.body.program  },
                 { 'academic_year' : req.body.acyear }
               ]
      
    }, function(err, ac) {
        
        if (err){
      console.log("Error ...1");
    }
        // check to see if theres already a user with that email
        if (ac!= null) {
      console.log("There have table(s) to show");
      console.log(ac);
    Work.findOne( { 
      $and: [
                 { '_type' :  'advisingProject' },
                 { 'nametitle' : req.body.name }
               ]
      
    }, function (err, rows) {
            if(err){
              console.log("Find thesis err"+err);
            }
            if(rows != null){
              console.log("This work have already");
              console.log(rows);
              //if user have already, set ref of id user to subject           
            }
            else{
          //if there is no user 
              // create the work
              var workobj = { 
            'nametitle': req.body.name,
            '_type' : 'advisingProject',            
            'acyear' :  ac._id,
            'user' : userarr
            
            }
          //also add subject code to user
              var newthesis       = new Work.Project(workobj);                    
              // save the user
              newthesis.save(function(err,thesis) {
                  if (err){console.log('new Thesis save'+err);}
                  else {
                    console.log("Save new thesis already"+thesis);
                    //set id of work to each user
                      async.eachSeries(array,function(item,callback) { 
               User.findOne({'_id': item._id},function(err,user){
                if(err){console.log("user can't find"+err);}
                if(user != null){
                  user.advisingProject.push(thesis._id); //save id of project to user
                  user.save(function(err,user) {
                              if (err){console.log('user cant update work id'+err);}  
                              else{
                                console.log("Update advisingProject succesful");
                                callback(err);  
                                                  
                              }                         
                          });  
                }
                else{
                  //can't find user, create new
                   // create the user
                         
                    //also add subject code to user
                    console.log(item);
                          var newUser        = new User(item);
                          newUser.advisingProject.push(thesis._id);                   
                          // save the user
                          newUser.save(function(err,user) {
                              if (err){console.log('Cant save new user'+err);}
                              else {
                                console.log("Insert new User already");
                                callback(err);       
                                }
                                  
                          });
                          }
                       });                            
                      
                },function(err) {
                    if (err) console.log('Async enroll err');
                    res.redirect('/thesisinf?name='+req.body.username);
                    console.log("done");
                });
                    }
                  });
              
              
            }
            
          });  
      
        } else {
           console.log("There not have table to show,make new");
           
         }
        });
    
     }); 

router.get('/editthesis',isLoggedIn,function(req,res){    
    console.log("[Get] Edit Thesis");
    console.log(req.query.id);
    console.log(req.query.user);

    Work.Project.findById(req.query.id, function( err, project ) {
        if( !err ) {
        console.log(project);
        Acyear.findById(project.acyear, function(err, ac) {            
            if (err){console.log("Error ...1");}
            // check to see if theres already a user with that email
            if (ac!= null) {          
             console.log(ac.academic_year);
             console.log(ac.program_name);
               Fac.find({},function(err,fac){
                if(err) console.log('Cant query fac'+err);
                 res.render('profile/works/editthesis.hbs', {
                    layout: "homePage",
                    project: project ,
                    username: req.query.user,
                    faculty: fac,
                    idwork : req.query.id,
                    acyear : ac.academic_year,
                    program : ac.program_name,
                    len : project.user.length,
                    helpers: {
                        inc: function (value) { return parseInt(value) + 1; },                        
                    }          
                  });                          
               });
            }         
          });            
        } else {
            return console.log( "query thesis err"+err );
          }
      }); 
});

router.post('/editthesis',isLoggedIn,function(req,res){
    console.log("Posttt Edit thesis");
    console.log(req.body.name);
    console.log(req.body.username);
    console.log(req.body.nameuser);
    console.log(req.body.roleuser);
    
    console.log(req.body.program)
    console.log(req.body.acyear);
    
    console.log(req.body.arrlen);
        
    var strlen = req.body.arrlen; 
    var remainlen = req.body.remainuser;
    var userdel = req.body.deluser;
    var userarr = [];
    var array = [];    
    var useradd = [];
    
      //advisee
      if(remainuser == strlen){
        array = [];
      }else{
        remainlen +=1;
        for(i= remainlen;i< strlen; i++){
          if(strlen==1){
            var userobj = {
              'iduser': req.body.nameuser,
              'typeuser' : req.body.roleuser
            }
            if(req.body.roleuser == 'advisee'){
              var obj ={ 
                      '_id' : req.body.nameuser,
                      'education': [],
                      'local': {
                      'username': req.body.nameuser,
                'name': req.body.nameuser,
                'program' : "",
                'role': "student"},
                }                   
            }else{
              var obj = { 
                      '_id' : req.body.nameuser,
                      'education': [],
                      'local': {
                      'username': req.body.nameuser,
                'name': req.body.nameuser,
                'program' : "",
                'role': "staff"}, 
                }                 
            }
          }else{
            var userobj = {
              'iduser': req.body.nameuser[i],
              'typeuser' : req.body.roleuser[i]
            }
            if(req.body.roleuser[i] == 'advisee'){
              var obj ={ 
                      '_id' : req.body.nameuser[i],
                      'education': [],
                      'local': {
                      'username': req.body.nameuser[i],
                'name': req.body.nameuser[i],
                'program' : "",
                'role': "student"},
                }                   
            }else{
              var obj = { 
                      '_id' : req.body.nameuser[i],
                      'education': [],
                      'local': {
                      'username': req.body.nameuser[i],
                'name': req.body.nameuser[i],
                'program' : "",
                'role': "staff"}, 
                }                 
            }
          }
          userarr.push(userobj);        
          array.push(obj);
        }

      }
        
    console.log(userarr);
    console.log(array); 
    Acyear.findOne({ 
        $and: [
                   { 'program_name' :  req.body.program  },
                   { 'academic_year' : req.body.acyear }
                 ]
        
      }, function(err, ac) {
          
          if (err){
        console.log("Error ...1");
      }
          // check to see if theres already a user with that email
      if (ac!= null) {
        console.log("There have table(s) to show");
        console.log(ac);
      Work.findById(req.body.idwork, function (err, rows) {
              if(err){
                console.log("Find thesis err"+err);
              }
              if(rows != null){
                console.log("This work have already");
                console.log(rows);
                
                var workobj = { 
              'nametitle': req.body.name,
              '_type' : 'advisingProject',            
              'acyear' :  ac._id,
              'user' : userarr
              
              }
            //also add subject code to user
                var newthesis       = new Work.Project(workobj);                    
                // save the user
                newthesis.save(function(err,thesis) {
                    if (err){console.log('new Thesis save'+err);}
                    else {
                      console.log("Save new thesis already"+thesis);
                      //set id of work to each user
               async.eachSeries(array,function(item,callback) { 
                 User.findOne({'_id': item._id},function(err,user){
                  if(err){console.log("user can't find"+err);}
                  if(user != null){
                    user.advisingProject.push(thesis._id); //save id of project to user
                    user.save(function(err,user) {
                                if (err){console.log('user cant update work id'+err);}  
                                else{
                                  console.log("Update advisingProject succesful");
                                  callback(err);  
                                                    
                                }                         
                            });  
                  }
                  else{
                    //can't find user, create new
                     // create the user
                           
                      //also add subject code to user
                      console.log(item);
                            var newUser        = new User(item);
                            newUser.advisingProject.push(thesis._id);                   
                            // save the user
                            newUser.save(function(err,user) {
                                if (err){console.log('Cant save new user'+err);}
                                else {
                                  console.log("Insert new User already");
                                  callback(err);       
                                  }
                                    
                            });
                            }
                         });                            
                        
                  },function(err) {
                      if (err) console.log('Async enroll err');
                      res.redirect('/thesisinf?name='+req.body.username);
                      console.log("done");
                  });
                      }
                    });
                
              }
              else{
           
                
                
              }
              
            });  
        
          } else {
             console.log("There not have table to show,make new");
             
           }
          });
      
}); 


router.get('/delthesis',isLoggedIn,function(req,res){
    console.log("Delete Thesis");
    console.log(req.query.id);
    console.log(req.query.user);
    Work.Project.findOneAndUpdate({ '_id' : req.query.id },
      {
       "$pull" :  {
        "user" :  {
             "iduser": req.query.user
            } //inserted data is the object to be inserted 
          }
        },function (err, useredit) {
          if (err){console.log('Cant delete advising project of user'+err);}
          else {console.log('Delete advising project of user already'+ useredit);}
      });

     User.findOneAndUpdate({ '_id' : req.query.user },
      {
       "$pull" : {
        "advisingProject" : req.query.id
           }
        },function (err, useredit) {
          if (err){console.log('Cant delete advising project of user'+err);}
          else {console.log('Delete advising project of user already'+ useredit);}
      });
    res.redirect('/thesisinf?name='+ req.query.user);   
    
});

module.exports = router;
