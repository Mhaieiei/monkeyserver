
var express 			= require('express');
var router  			= express.Router();
var async 				= require('async');
var mongoose 			= require('mongoose');
var User                     = require('../../model/user');
var Work                     = require('../../model/works');
var Fac                      = require('../../model/faculty');
var Acyear                   = require('../../model/academic_year');



var isLoggedIn = require('middleware/loginChecker');
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];
var adminfact = "";


router.get('/', function(req, res){	
	  console.log("Get Publication Information");
    console.log(req.query.name);
    if( req.user.local.role == 'admin'){
        adminfact = true;
     }else{
        adminfact = null;
     }
    User
    .findOne({'local.username': req.query.name})
    .populate('publicResearch')
    .exec(function(err, docs) {
      if(err) console.log(err);
      User.populate(docs, {
        path: 'publicResearch.user.iduser',   
         model: 'User'   
      },
      function(err, works) {
        if(err) console.log("cant find thesis of user"+err);
          // This object should now be populated accordingly.
        console.log(works);

          res.render("profile/works/publicinfo.ejs", {
              //layout: "profileAdstudent",
              userrole : req.user.local.role,
              user : req.query.name,
              Userinfo: works,
              year : years,
              acid : req.query.id,
           
             });

      });
    });   
});

  //add publication
router.get('/addpublication',isLoggedIn,function(req,res){
  console.log("Add Publication");
  console.log(req.query.user);
    Fac.find({},function(err,fac){
        if(err) console.log('Cant query fac'+err);
          res.render('profile/works/addpublic.hbs', {
          layout: "homePage",
          admin : adminfact,
          username : req.query.user, // get the user out of session and pass to template
          faculty : fac     
        });                        
      });
  
});   
  

router.post('/addpublication',isLoggedIn,function(req,res){
    console.log("Posttt Add Publication");
    console.log("username"+req.body.username);
    console.log("namepublic"+req.body.namepublic);
    console.log("program"+req.body.program);
    console.log("acyear"+req.body.acyear);
    console.log("typepublic"+req.body.typepublic)
    console.log("nameconfer"+req.body.nameconfer);
    console.log("namejournal"+req.body.namejournal);
    console.log("location"+req.body.location);
    console.log("vol"+req.body.vol);
    console.log("datenum"+req.body.datenum);
    console.log("issue"+req.body.issue);
    console.log("page"+req.body.page);
    console.log("article"+req.body.article);

    console.log("arrlen"+req.body.arrlen);
    console.log("nameuser"+req.body.nameuser);
    console.log("roleuser"+req.body.roleuser);
    
        
    var strlen = req.body.arrlen; 
    var userarr = [];
      var array = [];  
      //work object
      if(req.body.typepublic == 'intercon'){
        var publicobj = { 
            '_type' : 'publicResearch', 
            'namepublic': req.body.namepublic,  
            'typepublic' : req.body.typepublic,
            'page' : req.body.page,
            'datenum' : req.body.datenum, 
            'nameconfer' : req.body.nameconfer,
            'location' : req.body.location,         
        }
      }else{
        var publicobj = { 
            '_type' : 'publicResearch', 
            'namepublic': req.body.namepublic,  
            'typepublic' : req.body.typepublic,
            'page' : req.body.page,
            'datenum' : req.body.datenum,
            'namejournal' : req.body.namejournal,
            'vol' : req.body.vol,           
            'issue' : req.body.issue,
            'article' : req.body.article,         
        }
      } 
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
                 { '_type' :  'publicResearch' },
                 { 'namepublic' : req.body.namepublic }
               ]
      
    }, function (err, rows) {
            if(err){
              console.log("Find Publication err"+err);
            }
            if(rows != null){
              console.log("This work have already");
              console.log(rows);
              //if user have already, set ref of id user to subject           
            }
            else{
          //if there is no user 
              // create the work
              publicobj.user = userarr;
              publicobj.acyear = ac._id;
              console.log(publicobj);
         //       var workobj = { 
            // 'nametitle': req.body.name,
            // '_type' : 'advisingProject',           
            // 'acyear' :  ac._id,
            // 'user' : userarr
            
            // }
          //also add subject code to user
              var newpublic       = new Work.Public(publicobj);                   
              // save the user
              newpublic.save(function(err,thesis) {
                  if (err){console.log('new Publication save'+err);}
                  else {
                    console.log("Save new Publication already"+thesis);
                    //set id of work to each user
                      async.eachSeries(array,function(item,callback) { 
               User.findOne({'_id': item._id},function(err,user){
                if(err){console.log("user can't find"+err);}
                if(user != null){
                  user.publicResearch.push(thesis._id); //save id of project to user
                  user.save(function(err,user) {
                              if (err){console.log('user cant update work id'+err);}  
                              else{
                                console.log("Update Publication succesful");
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
                    res.redirect('/publicationinf?name='+req.body.username);
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
  
router.get('/editpublication',isLoggedIn,function(req,res){    
    console.log("[Get] Edit Publication");
    console.log(req.query.id);
    console.log(req.query.user);

    Work.Public.findById(req.query.id, function( err, public ) {
        if( !err ) {
        console.log(public);
        Acyear.findById(public.acyear, function(err, ac) {            
            if (err){console.log("Error ...1");}
            // check to see if theres already a user with that email
            if (ac!= null) {          
             console.log(ac.academic_year);
             console.log(ac.program_name);
               Fac.find({},function(err,fac){
                if(err) console.log('Cant query fac'+err);
                 res.render('profile/works/editpublic.hbs', {
                    layout: "homePage",
                    admin : adminfact,
                    public: public ,
                    username: req.query.user,
                    faculty: fac,
                    acid : req.query.id,
                    acyear : ac.academic_year,
                    program : ac.program_name,
                    len : public.user.length,
                     helpers: {
                        inc: function (value) { return parseInt(value) + 1; },                        
                    }          
                  });                          
               });
            }         
          });            
        } else {
            return console.log( "query public err"+err );
          }
      }); 
});

router.get('/delpublication',isLoggedIn,function(req,res){
    console.log("Delete Publication");
    console.log(req.query.id);
    console.log(req.query.user);
    
     Work.findById(req.query.id, function(err, sub) {            
            if (err){
              console.log("Error ...1");
            }
            // check to see if theres already a user with that email
            if (sub!=null) {
               console.log("That code is already have");
               console.log(sub.user);
              async.eachSeries(sub.user,function(item,callback) {          
                User.findOneAndUpdate({ '_id' : item.iduser },
                {
                 "$pull" : {
                  "publicResearch" : req.query.id
                     }
                  },function (err, useredit) {
                    if (err){console.log('Cant delete public of user'+err);}
                    else {
                      console.log('Delete public of user already'+ useredit);
                      callback(err);
                    }
                });
          },function(err) {
              if (err) console.log('mhai_4');
              Work.remove(
                  { '_id' : req.query.id },
                  function(err, results) {
                    if (err){console.log('delete public err'+err);}
                  else console.log("delete already");
                  }
               );
               res.redirect('/publicationinf?name='+ req.query.user);   
    
              console.log("done");
          });
        }

   
     
   
   });
});


module.exports = router;
