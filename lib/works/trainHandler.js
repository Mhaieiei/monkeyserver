
var express       = require('express');
var router        = express.Router();
var async         = require('async');
var mongoose      = require('mongoose');
var User                     = require('../../model/user');
var Work                     = require('../../model/works');
var Fac                      = require('../../model/faculty');
var Acyear                   = require('../../model/academic_year');


var isLoggedIn = require('middleware/loginChecker');
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];
var adminfact = "";


router.get('/', function(req, res){ 
   console.log("Get Training Information");
   if( req.user.local.role == 'admin'){
        adminfact = true;
     }else{
        adminfact = null;
     }
    console.log(req.query.name);
    User
    .findOne({'local.username': req.query.name})
    .populate('training')
    .exec(function(err, docs) {
      if(err) console.log(err);
      console.log(docs);
      var username = req.query.name;
       res.render("profile/works/traininf.hbs", {
            layout: "homePage",
            username : req.query.name,
            admin : adminfact,
            Userinfo: docs,
            year : years,
             helpers: {
                inc: function (value) { return parseInt(value) + 1; },
                getuser: function () { return username; },
            }               
       });             
    });   
});

router.get('/addtraining',isLoggedIn,function(req,res){
    console.log("Add Training");
    console.log(req.query.username);
     Fac.find({},function(err,fac){
        if(err) console.log('Cant query fac'+err);
         res.render('profile/works/addtraining.hbs', {
            layout: "homePage",
            admin : adminfact,
            username : req.query.username,
            faculty: fac 
            });
                  
       }); 
   
}); 

router.post('/addtraining',isLoggedIn,function(req,res){
    console.log("[POST]Add training");    
    console.log(req.body.nametrain);
    console.log(req.body.hour);
    console.log(req.body.acyear);
    console.log(req.body.subprogram);
    console.log(req.body.username);
    Acyear.findOne({ 
      $and: [
                 { 'program_name' :  req.body.subprogram  },
                 { 'academic_year' : req.body.acyear }
               ]
      
    }, function(err, ac) {
        
        if (err){console.log("Error ...1");}
        // check to see if theres already a user with that email
        if (ac!= null) {
      
         console.log(ac);
        Work.Training.findOne( { 
        $and: [
                   { '_type' :  'training' },
                   { 'trainingCourse' : req.body.nametrain }
                 ]
        
      }, function (err, training) {
              if(err){
                console.log("Find Training err"+err);
              }
              if(training != null){
                console.log("This work have already");
                //console.log(rows);
                //if user have already, set ref of id user to subject  
                  training.academicYear = ac.id;
                  training.trainingCourse = req.body.nametrain;
                  training.hour = req.body.hour;    
                  training.user = req.body.username;           
                  // save the user
                  training.save(function(err,train) {
                      if (err){console.log('new Training save'+err);}
                      else {
                       console.log("Update training already"+train);                      
                       res.redirect('/traininf?name='+req.body.username);
                      }
                  });         
              }
              else{
            
                var newtraining       = new Work.Training();
                  newtraining.academicYear = ac.id;
                  newtraining.trainingCourse = req.body.nametrain;
                  newtraining.hour = req.body.hour;    
                  newtraining.user = req.body.username;           
                // save the user
                newtraining.save(function(err,train) {
                    if (err){console.log('new Training save'+err);}
                    else {
                     console.log("Save new training already"+train);                      
                     User.findOne({'_id': req.body.username},function(err,user){
                      if(err){console.log("user can't find"+err);}
                      if(user != null){
                        user.training.push(train._id); //save id of project to user
                        user.save(function(err,user) {
                                    if (err){console.log('user cant update work id'+err);}  
                                    else{
                                      console.log("Update Trianing succesful");
                                      res.redirect('/traininf?name='+req.body.username);
                                     }                         
                                });  
                      }
                     }); 
                    }
               });
            }
          });
      }
     
    });
});

router.get('/edittrain',isLoggedIn,function(req,res){    
    console.log("[Get]Admin Edit Trianing");
    console.log(req.query.id);
    console.log(req.query.user);

    Work.Training.findById(req.query.id, function( err, training ) {
        if( !err ) {
        console.log(training);
        Acyear.findById(training.academicYear, function(err, ac) {            
            if (err){console.log("Error ...1");}
            // check to see if theres already a user with that email
            if (ac!= null) {          
             console.log(ac.academic_year);
             console.log(ac.program_name);
               Fac.find({},function(err,fac){
                if(err) console.log('Cant query fac'+err);
                 res.render('profile/works/edittraining.hbs', {
                    layout: "homePage",
                    admin: adminfact,
                    traning: training ,
                    username: req.query.user,
                    faculty: fac,
                    acid : req.query.id,
                    acyear : ac.academic_year,
                    program : ac.program_name          
                  });                          
               });
            }         
          });            
        } else {
            return console.log( "query training err"+err );
          }
      }); 
  });

router.get('/deltrain',isLoggedIn,function(req,res){
    console.log("Delete Training");
    console.log(req.query.id);
    console.log(req.query.user);
    Work.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('delete training err'+err);}
          else console.log("delete already");
          }
       );

     User.findOneAndUpdate({ '_id' : req.query.user },
      {
       "$pull" : {
        "training" : req.query.id
           }
        },function (err, useredit) {
          if (err){console.log('Cant delete training of user'+err);}
          else {console.log('Delete training of user already'+ useredit.training.length);}
      });
    res.redirect('/traininf?name='+req.query.user);   
    
  });


module.exports = router;
