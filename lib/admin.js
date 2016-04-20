
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
var Doc                      = require('../model/document');
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
	console.log("Get Admin");
    console.log(current_year);
    res.render('admin/home.hbs', {
      layout: "adminMain",
            user : req.user // get the user out of session and pass to template     
        });
});


    //user section================================================================================== 
router.get('/user',isLoggedIn,function(req,res){
    console.log('Admin select track');
    return Fac.find( function( err, faculty ) {
        if( !err ) {
      console.log(faculty);
            res.render("admin/faculty/user/userselect.hbs", {
              layout: "adminPage",
              user : req.user,
              faculty: faculty,
              year : years,
              helpers: {
              set: function (value) { index = value; },
              get: function(){return index;},
            
            }
            });
        } else {
            return console.log( "cant query fac"+err );
          }
      });

});
router.post('/user',isLoggedIn,function(req,res){
    console.log("Admin Post User");
    console.log(req.body.sub_programs);
    console.log(req.body.userrole);
    if(req.body.program == 'other'){
      console.log("other");
      User.find( { 'local.program' : ""  }, function (err, users) {
            if(!err){             
              console.log(users);
               res.render('admin/faculty/user/userslist.hbs',{
              layout : "adminPage",
              user: req.user,
              alluser: users,
              program: req.body.sub_programs,
              role: req.body.userrole
            });
            }
            else{
              console.log("err");
            }
          });

    }
    else if(req.body.userrole=="all"){
      console.log("all");
      User.find( { 'local.program' : req.body.sub_programs  }, function (err, users) {
            if(!err){             
              console.log(users);
               res.render('admin/faculty/user/userslist.hbs',{
              layout : "adminPage",
              user: req.user,
              alluser: users,
              program: req.body.sub_programs,
              role: req.body.userrole
            });
            }
            else{
              console.log("err");
            }
          });
    }
    else{
      User.find({
        $and: [
                 { 'local.program' : req.body.sub_programs },
                 { 'local.role' : req.body.userrole }
               ]
       

        }, function (err, users) {
            if(!err){             
              console.log(users);
               res.render('admin/faculty/user/userslist.hbs',{
              layout : "adminPage",
              user: req.user,
              alluser: users,
              program: req.body.sub_programs
            });
            }
            else{
              console.log("err");
            }         
          });

    }
    
  
});

router.get('/showuser',isLoggedIn,function(req,res){
    console.log("admin show user list");
    console.log(req.query.program);
    
        
    User.find( { 'local.program' : req.query.program  }, function (err, users) {
          if(!err){             
            
             res.render('admin/faculty/user/userslist.hbs',{
            layout : "adminPage",
            user: req.user,
            alluser: users,
            program: req.query.program
          });
          }
          else{
            console.log("err");
          }
        });
});

router.get('/adduser',isLoggedIn,function(req,res){
    console.log("Admin Get add user setting");
    console.log(req.query.program);
    res.render('admin/faculty/user/adduser.hbs', {
      layout: "adminPage",
            user : req.user, // get the user out of session and pass to template
            program: req.query.program      
        });
});

router.post('/adduser',isLoggedIn,function(req,res){
      console.log('Admin Post add user setting');
      console.log(req.body.arrlen);
      console.log(req.body.username);
      var document = {name:"David", title:"About MongoDB"};
      var lenn = req.body.arrlen;
      
      var array = [];
      var records = [ { body: 'Test 1'}, { body: "Test 2" } ];
      for(var i=0;i<lenn;i++){
        if(lenn==1){
          var obj = { 
          '_id' : req.body.username,
          'local': {
          'username':req.body.username,
          'password': req.body.username,
          'name': req.body.name,
          'role': req.body.role,
          'program': req.body.program,
          'faculty': "IC"
           }
          }
        }
        else{
          var obj = {
            '_id' : req.body.username[i],
            'local' :{
            'username' : req.body.username[i],
            'password' : req.body.username[i],
            'name' : req.body.name[i],
            'role' : req.body.role[i],
            'program': req.body.program,
            'faculty': "IC"
          }
        }
          
        }
        
        array.push(obj);
      }
     
      
      console.log(obj);
      console.log(records);
      console.log(array);

      var arraytest = {"nameofwork":"thesis2","detail":"thesis year"};
    	//use JSON.stringify to convert it to json string
        var jsonstring = JSON.stringify(arraytest);
        //convert json string to json object using JSON.parse function
        var jsonobject = JSON.parse(jsonstring);
     
        async.eachSeries(array,function(item,callback) {
          
          User.find( { 'local.name' :  item.username }, function (err, rows) {
            if(err){
              console.log("err");
            }
            if(rows != ""){
              console.log("This user have already");
              console.log(rows);
              console.log(item);
              callback(err);
            }
            else{
            //if there is no user with that email
                // create the user
                var newUser        = new User(item);
               
                // save the user
                newUser.save(function(err,user) {
                    if (err){console.log('mhaiiiiiii'+err);}
                    else console.log("Insert already"+user);
                });
              console.log("mhai_eiei");
                console.log(item.username);
                console.log(item.type);
                callback(err);
            }
            
          });
      },function(err) {
          if (err) throw err;
          console.log("done");
      });    
    	res.redirect('/admin/showuser?program='+req.body.program);    
});

router.get('/deluser',isLoggedIn,function(req,res){
    console.log("Delete User");
    console.log(req.query.id);
    //console.log(req.query.email);

    User.remove(
          { 'local.username' : req.query.id },
          function(err, results) {
            if (err){console.log('mhaiiiiiii');}
          else console.log(results);
          }
       );
    res.redirect('/admin/showuser?program='+req.query.program);     
    
});

  


module.exports = router;
