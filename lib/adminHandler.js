
var express 			= require('express');
var router  			= express.Router();
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


var subjectControl     = require('../lib/admin/subjectHandler.js');  //subject handler


var isLoggedIn = require('middleware/loginChecker');
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];
var dialog = require('dialog');
var programreturn = "";


 

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
    var program = "";
    program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }
    res.render('admin/faculty/user/adduser.hbs', {
      layout: "adminPage",
            user : req.user, // get the user out of session and pass to template
            program: program   
        });
});

router.post('/adduser',isLoggedIn,function(req,res){
      console.log('Admin Post add user setting');
      console.log(req.body.arrlen);
      console.log(req.body.username);
      console.log("req.query.program:"+req.query.program);
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
          'program': req.query.program,
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
            'program': req.query.program,
            'faculty': "IC"
          }
        }
          
        }
        
        array.push(obj);
      }
     
      
      console.log("obj:"+obj);
      console.log("records:"+records);
      console.log("array:"+array);

      var arraytest = {"nameofwork":"thesis2","detail":"thesis year"};
    	//use JSON.stringify to convert it to json string
        var jsonstring = JSON.stringify(arraytest);
        //convert json string to json object using JSON.parse function
        var jsonobject = JSON.parse(jsonstring);
     
        async.eachSeries(array,function(item,callback) {
          
          User.find( { 'local.name' :  item.local.username }, function (err, rows) {
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
    	res.redirect('/admin/showuser?program='+req.query.program);    
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
//------------------------------------------------student status-----------------------------------------------------------------------

router.get('/add_student_status',isLoggedIn,function(req,res){
    console.log("Admin add_student_status");
    console.log(req.query.user);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

    User.findOne( { 'local.username' :  req.query.user }, function (err, user) {


    res.render('admin/faculty/user/add_student_status.hbs', {
      layout: "adminPage",
            user : user, // get the user out of session and pass to template
            // program: program   
        });
    });

});  

router.post('/add_student_status',isLoggedIn,function(req,res){
      console.log('Admin add_student_status');
  
      console.log("req.body.status:"+req.body.status);
      console.log("req.body.academicYear:"+req.body.academicYear);
      console.log("req.query.user:"+req.query.user);
   
      User.findOne( { 'local.username' :  req.query.user }, function (err, user) {

        console.log("user:"+user);

        var obj = {"status":req.body.status,"academicYear":req.body.academicYear};


        if(!isNaN(req.body.academicYear)){

        User.update(
                        {"local.username":req.query.user,"detail.academicYear": { $ne: req.body.academicYear }}, 
                        { $addToSet: { "detail": obj} }
                      , function(err, add_detail_student) { 

                        if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          if(add_detail_student == 1){

                            console.log('ADD detail TO student SUCCESSFUL : '+add_detail_student)
                          }
                            else{
                              
                              User.update(
                                {"local.username":req.query.user,detail:{$elemMatch:{academicYear:req.body.academicYear}}}, {$set: {'detail.$.status':req.body.status}}
                                
                              , function(err, add_detail_student) { 

                                if (err){console.log('cant edit new STATUS'+err);}  
                                else{
                                  console.log('EDIT detail TO student SUCCESSFUL : '+add_detail_student)
                                  
                                  

                                  }


                              });


                            }

                          


                        }

                        });
    }
    else{
      dialog.info('Academic Year have to be a number :)');
    }
   
    });
      
     res.redirect('/admin/show_student_status?user='+req.query.user);
       
       
});

router.get('/show_student_status',isLoggedIn,function(req,res){
    console.log("Admin add_student_status");
    console.log(req.query.user);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

    User.findOne( { 'local.username' :  req.query.user }, function (err, user) {


    res.render('admin/faculty/user/show_student_status.hbs', {
      layout: "adminPage",
            user : user, // get the user out of session and pass to template
            // program: program   
        });
    });

});  

//------------------------------------------------ROLE------------------------------------------------------------------
router.get('/view_user_role',isLoggedIn,function(req,res){
    console.log("Admin view_user_role");
    
    console.log("Admin req.query.user: "+req.query.user);
    console.log("Admin req.query.program: "+req.query.program);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

   User.findOne(
          {"local.username":req.query.user})
         // , function(err, docs) {
      .populate('roleOfStaff')
      .exec(function (err, docs) {

        console.log("docs: "+docs);
 
    res.render('admin/faculty/user/view_user_role.hbs', {
      layout: "adminPage",
            user : req.query.user, // get the user out of session and pass to template
            program: req.query.program   ,
            docs:docs,
            helpers: {
                    getProgram: function () { return req.query.program; },
                    getUser: function () { return req.query.user; },

                    
                }
        });
    });
    

});

router.get('/add_role',isLoggedIn,function(req,res){
    console.log("Admin add_role");
    
    console.log("Admin req.query.user: "+req.query.user);
    console.log("Admin req.query.program: "+req.query.program);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

   
 

    res.render('admin/faculty/user/add_role.hbs', {
      layout: "adminPage",
            user : req.query.user, // get the user out of session and pass to template
            program: req.query.program   
        });
    

});

router.post('/add_role', isLoggedIn, function (req, res) {

      console.log("post add_role");
      console.log("req.body.arrlen+ "+req.body.arrlen);
      console.log("req.query.program: "+req.query.program);

    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepMethod;
      var check = 0;
      var check_duplicate = 0;

      console.log('ARRAY ----req.body.count--- >'+req.body.count);
      console.log('ARRAY ----req.body.job_des--- >'+req.body.job_des);

      // console.log('ARRAY ----req.body.method.length--- >'+req.body.method.length);
      if(req.body.count==0 && req.body.job_des.length ==1){

          // var obj = {

          //   'methodName': req.body.method,
          //   'frequency' : req.body.ftype

          // }

          array.push(req.body.job_des);
          
        }else{
      for(var i=0;i< strlen;i++){
        
          console.log('ARRAY ----req.body.job_des[i]--- >'+req.body.job_des[i]);
          keepJob = req.body.job_des[i];
          for(var j=i+1;j< strlen;j++){

            if(keepJob == req.body.job_des[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){

          //   var obj = {

          //   'methodName': req.body.method[i],
          //   'frequency' : req.body.ftype[i]

          // }
            
            array.push(req.body.job_des[j]);
          }
          else{
            dialog.info('Have same job descrption more than 1 in the list:)');

          }

          check = 0;
        }        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

      Role.roleOfStaff.findOne({
          $and: [
                   { 'position': req.body.position },
                   { 'program': req.query.program },
                   { 'academicYear': req.body.academicYear }
          ]
         
      }, function(err, role) {
    if (role == null) {
    console.log("ADD NEWWWW");
            

            newRole = new Role.roleOfStaff();
            newRole.type = req.body.type;
            newRole.position = req.body.position;
            newRole.program = req.query.program;
            newRole.academicYear = req.body.academicYear;
            newRole.jobDescription = req.body.job_des;
            newRole.user+= req.query.user;

            // var obj_eva = {"stakeholder":req.body.stak_name,"EvaluationMethod":array};
            // console.log('obj_eva----> : '+obj_eva)
            // console.log('req.query.program----> : '+req.query.program)

            newRole.save(function(err,add_eva) {
                      if (err){console.log('cant edit new program Management'+err);}  
                      else{
                            console.log('Add eva SUCCESSFUL :'+add_eva);

                            Role.roleOfStaff.findOne({
                                  $and: [
                                           { 'position': req.body.position },
                                           { 'program': req.query.program },
                                           { 'academicYear': req.body.academicYear }
                                  ]
                                 
                              }, function(err, role) {
                                  console.log('role.id : '+role.id)

                                      User.update(
                                           { "local.username": req.query.user },
                                           { $push: { roleOfStaff: role.id } }
                                        , function(err, add_eva) { 

                                            if (err){console.log('cant edit new program Management'+err);}  
                                            else{

                                              console.log('ADD role TO user SUCCESSFUL : '+add_eva)

                                              // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


                                            }

                                        }); 



                                });  

                          }
                         

                        });  
}
else{

  console.log('check-----role.id----------->'+role.id);

            User.findOne({
          $and: [
                   { 'local.username': req.query.user },
                   { 'local.program': req.query.program },
                   { roleOfStaff: role.id } 
          ]
         
      }, function(err, check) {
          console.log('check---------------->'+check);
       
            if(check == null){
         Role.roleOfStaff.findOne({
          "_id":role.id
         
      }, function(err, exist_role) {        
        
          console.log("EDIT-------------------->:"+exist_role);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          console.log('ARRAY ---EDITTTT---- >'+array);
          
          
          
          
            exist_role.type = exist_role.type;
            exist_role.position = req.body.position;
            exist_role.program = req.query.program;
            exist_role.academicYear = req.body.academicYear;
            exist_role.user.push(req.query.user);
            exist_role.jobDescription = req.body.job_des;

          exist_role.save(function (err) {
            if(err) {
                console.error('Cant update new facility'+err);


            }

            User.update(
               { "local.username": req.query.user },
               { $push: { roleOfStaff: exist_role.id } }
            , function(err, add_eva) { 

                if (err){console.log('cant edit new program Management'+err);}  
                else{

                  console.log('EDIT role TO user SUCCESSFUL : '+add_eva)

                  // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


                }

            }); 
            // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
            
          });

           });

       }
       else{

        dialog.info('This user already has these role');
       }
          });
       }

    });
      }
  res.redirect('/admin/view_user_role?user='+req.query.user+'&program='+req.query.program);
                 
         
  });



router.get('/del_user_role',isLoggedIn,function(req,res){
    console.log("Delete User role");
    console.log(req.query.user);
    //console.log(req.query.email);

    User.update(
            {"local.username":req.query.user}, 
            { $pull: { roleOfStaff: req.query.id} },
            {multi: true}
          , function(err, delete_role_user) {


            if (err){console.log('cant delete role from user'+err);}  
                else{

                  console.log('DELETE role FROM user SUCCESSFUL : '+delete_role_user)

                  // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
                  Role.roleOfStaff.update(
                    {"_id":req.query.id}, 
                    { $pull: { user: req.query.user} },
                    {multi: true}
                  , function(err, delete_user_role) {


                    if (err){console.log('cant delete user from role'+err);}  
                        else{

                          console.log('DELETE user FROM role SUCCESSFUL : '+delete_user_role)

                          // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);


                        }

                  });

                }





          });
    res.redirect('/admin/view_user_role?user='+req.query.user+'&program='+req.query.program);     
    
});

router.get('/view_role_admin',isLoggedIn,function(req,res){
    console.log("Admin view_role_admin");
    
    
    console.log("Admin req.query.program: "+req.query.program);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

   Role.roleOfStaff.aggregate(

            [
                    {
                        $match: {
                          $and: [
                                 { 'jobDescription': { $exists: true } },
                                 { 'program': req.query.program }
                 
                          ]
                        }
                      },
                      {
                        $group: {
                            _id: { type: "$type", academicYear: "$academicYear" },
                            root: { $push: "$$ROOT" },
                            

                        }
                    },
                    {
                        $group: {
                            _id: "$_id.type",
                            
                            detail: { $push: "$$ROOT" },
                            

                        }
                    }
         ]
        , function (err, docs) {
     

        console.log("docs: "+docs);
 
    res.render('admin/faculty/user/view_role_admin.hbs', {
      layout: "adminPage",
            // user : req.query.user, // get the user out of session and pass to template
            program: req.query.program   ,
            docs:docs,
            helpers: {
                    getProgram: function () { return req.query.program; },
                    // getUser: function () { return req.query.user; },

                    
                }
        });
    });
    

});

router.get('/del_role_admin',isLoggedIn,function(req,res){
    console.log("Admin del_role_admin");
    
    
    console.log("Admin req.query.program: "+req.query.program);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

   User.update(
            {}, 
            { $pull: { roleOfStaff: req.query.id} },
            {multi: true}
          , function(err, delete_role_user) {


            if (err){console.log('cant delete role from user'+err);}  
                else{

                  console.log('DELETE role FROM user SUCCESSFUL : '+delete_role_user)

                  // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
                  Role.roleOfStaff.remove({ '_id' : req.query.id },function(err, results) {
                  if (err){console.log('Delete Role.roleOfStaff err'+err);}
                  else{
                     

                     console.log("Delete role SUCCESSFUL"+results);

                  }
                });

                }





          });
   res.redirect('/admin/view_role_admin?program='+req.query.program);
    

});


router.get('/edit_role_admin',isLoggedIn,function(req,res){
    console.log("Admin edit_role_admin");
    
    // console.log("Admin req.query.user: "+req.query.user);
    console.log("Admin req.query.program: "+req.query.program);
    // var program = "";
    // program = req.query.program;
    // if(req.query.program == ""){
    //   program = req.query.program;
    // }

   
      Role.roleOfStaff.findOne({
          "_id":req.query.id
         
      }, function(err, role) {

        console.log("role: "+role);
        console.log("role.jobDescription.length: "+role.jobDescription.length);
      
        
       
          res.render('admin/faculty/user/edit_role_admin.hbs', {
            layout: "adminPage",
                  role:role,
                  program: req.query.program   ,
                  len:role.jobDescription.length
              });
        
        

     });
    

});

router.post('/edit_role_admin', isLoggedIn, function (req, res) {

      console.log("post edit_role_admin");
      console.log("req.body.arrlen+ "+req.body.arrlen);
      console.log("req.query.program: "+req.query.program);

    var strlen = req.body.arrlen; 
    
      var array = [];
      var keepMethod;
      var check = 0;
      var check_duplicate = 0;

      console.log('ARRAY ----req.body.count--- >'+req.body.count);
      console.log('ARRAY ----req.body.job_des--- >'+req.body.job_des);

      // console.log('ARRAY ----req.body.method.length--- >'+req.body.method.length);
      if(req.body.count==0 && req.body.job_des.length ==1){

          array.push(req.body.job_des);
          
        }else{
      for(var i=0;i< strlen;i++){
        
          console.log('ARRAY ----req.body.job_des[i]--- >'+req.body.job_des[i]);
          keepJob = req.body.job_des[i];
          for(var j=i+1;j< strlen;j++){

            if(keepJob == req.body.job_des[j]){

              check =1;
              check_duplicate = 1;
            }


          }
          if(check == 0){

            array.push(req.body.job_des[j]);
          }
          else{
            dialog.info('Have same job descrption more than 1 in the list:)');

          }

          check = 0;
        }        
      }

      if(check_duplicate == 0 ){

      console.log('ARRAY ------- >'+array);

      Role.roleOfStaff.findOne({
          "_id":req.query.id
         
      }, function(err, role) {
    


          console.log('check-----role.id----------->'+role.id);
          console.log("EDIT-------------------->:"+role);
          console.log("EDIT-------req.query.program------------->:"+req.query.program);
          console.log('ARRAY ---EDITTTT---- >'+array);
          
          
          
          
            role.type = req.body.type;
            role.position = req.body.position;
            role.program = req.query.program;
            role.academicYear = req.body.academicYear;
            role.jobDescription = req.body.job_des;

          role.save(function (err) {
            if(err) {
                console.error('Cant update new facility'+err);


            }
            else{console.log('EDIT role SUCCESSFUL : ')}

            
            // res.redirect('/aun/aun11-4?program='+req.query.program+'&year='+req.query.year+'&acid='+req.query.acid);
            
          });

               
       

    });
      }
  res.redirect('/admin/view_role_admin?program='+req.query.program);
                 
         
  });







 //program section======================================================================================================================
router.get('/programs',isLoggedIn,function(req,res){
    console.log('Admin Get Program');
    console.log(years);
    console.log(years[0]);
    return Fac.find({}, function( err, faculty ) {
        if( !err ) {
      console.log(faculty);
            res.render("admin/faculty/program/program.hbs", {
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
            return console.log( err+"mhaieiei" );
          }
      });   
    
});
router.post('/programs',isLoggedIn,function(req,res){
    console.log("Admin Post Program");
    console.log(req.body.sub_programs);
    console.log(req.body.years);
    programreturn = req.body.sub_programs;
    Acyear.findOne({ 
      $and: [
                 { 'program_name' :  req.body.sub_programs  },
                 { 'academic_year' : req.body.years }
               ]
      
    }, function(err, ac) {
        
        if (err){
      console.log("Error ...1");
    }
        // check to see if theres already a user with that email
        if (ac!= null) {
      console.log("There have table(s) to show");
      console.log(ac);
      res.redirect('/admin/showprogram?id='+ac.id+"&program="+req.body.sub_programs);
      // res.render('admin/faculty/searchprogram.hbs',{
      //  layout: "adminMain",
      //  user: req.user,
      //  program : req.body.sub_programs,
      //  acid : ac.id,
      //  year : req.body.years
        
      //  });
      // });
        } else {
           console.log("There not have table to show,make new");
           var acYear        = new Acyear();

            // set the user's local credentials
      acYear.academic_year = req.body.years;
      acYear.program_name = req.body.sub_programs;
      
            // save the acyear
            acYear.save(function(err,acc) {
              if (err){console.log('mhaiiiiiii');}
                else{
                 nametemp = acc.id;
                 console.log("Insert already"+ nametemp); 
                 res.redirect('/admin/showprogram?id='+acc.id+"&program="+req.body.sub_programs);                 
                }
            });
          
         }
        });
  
});

router.get('/editprogram',isLoggedIn,function(req,res){
    console.log('Admin edit program');
    console.log(req.query.program);
    return Fac.findOne({'programname': req.query.program}, function( err, program ) {
        if( !err ) {
      console.log(program);
            res.render("admin/faculty/program/editprogram.hbs", {
              layout: "adminPage",
              user : req.user,
              program: program,
              year : years,
              helpers: {
              set: function (value) { index = value; },
              get: function(){return index;},
            
            }
            });
        } else {
            return console.log( err+"mhaieiei" );
          }
      });

});


    
router.get('/showprogram',isLoggedIn,function(req,res){
      console.log("Admin get showprogram");
      console.log(req.query.id)
      console.log(req.query.program)
      var acayear = req.query.id;
      Teach.aggregate(
                      [
                    {
                        $match: {
                            'ac_id': req.query.id
                        }
                    },
                    {
                        $group: {
                            _id: "$plan",
                            teach: { $push: "$$ROOT" }
                            
                       
                       
                      }
                    }
                  ]
                  , function (err, teach) {

                    console.log("TEACH---teach--->"+teach);

	    Teach.populate(teach, {
          path: 'teach.subject.subcode',
          model: 'Subject'
        },
        function(err, docs) {
	    
	      if(err) console.log(err);


	      Teach.populate(docs, {
	        path: 'teach.subject.subcode.sub_lecter',
	        model: 'User'
	      },
	      function(err, subs) {
	        if(err) console.log(err);
	          // This object should now be populated accordingly.
	        console.log("TEACH----subs-->"+subs);
	        Work.Meeting.find( { 
	          $and: [
	                     { '_type' :  'meetingOfProgram' },
	                     {  'acyear' : req.query.id}
	               ]      
	        }, function (err, meeting) {
	          if(err) console.log("query meetings err"+err);
	          console.log(meeting);

            Program
              .findOne({'programname': req.query.program})
              .populate([{path:'referenceCurriculum'},{path:'structureOfCurriculum'}])
              .exec(function(err, ref) {
              if(err) console.log('query ref err'+err)
              console.log('ref'+ref)
              //console.log('ref structure'+ ref.structureOfCurriculum)
              //console.log('ref curriculum'+ ref.referenceCurriculum)
              res.render("admin/faculty/program/showprogram.hbs", {
                  layout: "adminPage",
                  user : req.user,
                  teachsemes: subs,
                  meetings : meeting,
                  ref : ref.referenceCurriculum,
                  struct : ref.structureOfCurriculum,
                  year : years,
                  acid : req.query.id,
                  program:req.query.program,
                  helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getacid: function () { return acayear; },
                  getprogram: function(){ return req.query.program},
                  getacid: function(){ return req.query.id}
                } 
              });


            });

  	          

	        });
	      });
	    });
       });

});

router.get('/addprogram',isLoggedIn,function(req,res){
    console.log("Admin Add Head program");
    res.render('admin/faculty/program/addprogram.hbs',{
      layout: "adminPage",
      user: req.user
    });
});

router.post('/addprogram',function(req,res){
    console.log("Admin Post add head program");
    console.log(req.body.program_head_name);
    console.log(req.body.sub_program);
    console.log(req.body.sub_program[0]);
    var sub_track = req.body.sub_program;
    
    console.log(sub_track.length);
    
    Fac.findOne({ 'programname' : req.body.program_head_name },
    function(err, sub) {
            console.log(nametemp);
            if (err){
        console.log("Error ...1");
      }
            // check to see if theres already a user with that email
            if (sub!= null) {
              console.log(sub);
        console.log("That code is already have");
        sub.editProgram(req,res);
            } else {
                // if there is no user with that email
                // create the user
                var newFac        = new Fac();

                // set the user's local credentials
        newFac.programname = req.body.program_head_name ;
        newFac.sub_program = req.body.sub_program;
            
                // save the user
                newFac.save(function(err,teach) {
                    if (err){console.log('mhaiiiiiii');}
                    else console.log("Insert already"+ teach);
                });
                res.redirect('/admin/programs');
            }

        });  
    

});
router.get('/delprogram',isLoggedIn,function(req,res){
    console.log("Delete Program");
    console.log(req.query.programname);
    //console.log(req.query.email);

    Fac.remove(
          { 'programname' : req.query.programname },
          function(err, results) {
            if (err){console.log('mhaiiiiiii');}
          else console.log(results);
          }
       );
    res.redirect('/admin/programs');
});

router.get('/editsubprogram',isLoggedIn,function(req,res){
    console.log('Admin edit program');
    console.log(req.query.id);
    console.log(req.query.year);
    console.log(req.query.semes)
    //var acayear = req.query.id;
    Teach
    .findById(req.query.id)
    .populate('subject.subcode')
    .exec(function(err, docs) {
      if(err) return callback(err);
      console.log(docs.subject[0].subcode);
      Teach.populate(docs, {
        path: 'subject.subcode.sub_lecter',
        model: 'User'
      },function(err, subs) {
        if(err) return callback(err);
         Teach.Structure.find({
         $and: [
             { 'program' : programreturn },
                 { 'knowledgeBlock' : { $exists: true } },
                 
               ]
            }, function(err, plan) {
              res.render("admin/faculty/program/editsubprogram.hbs", {
                  layout: "adminPage",
                  user : req.user,
                  subprogram: subs,
                  len : subs.subject.length,
                  acid : req.query.id,
                  year : yearlevel,
                  plan : plan,
                  helpers: {
                  inc: function (value) { return parseInt(value) + 1; }              
                  } 
               
                 });
          });    
        });
    });
});
 
router.get('/addsubprogram',isLoggedIn,function(req,res){
    console.log('Admin add Program');
    console.log(req.query.acid);
    console.log(yearlevel);
    console.log('program:'+req.query.program);
    Teach.Structure.find({
       $and: [
           { 'program' : req.query.program },
               { 'knowledgeBlock' : { $exists: true } },
               
             ]
      }, function(err, plan) {
        console.log("plan: "+plan);
          res.render("admin/faculty/program/addprogramtrack.hbs",{
            layout : "adminPage",
            user : req.user,
            acid : req.query.acid,
            program : req.query.program,
            yearlevel : yearlevel,
            plan : plan
          });
    });
}); 
    
router.post('/addsubprogram',isLoggedIn,function(req,res){
    console.log("Posttt Add Program");
    console.log(req.body.acid);
    //console.log(req.body.subject_lec);
    //subject objects
    var lenn = req.body.arrlen;     
      var array = [];    
      var arrsub = [];
      var year_1,year_2,year_3= "";
    console.log(lenn);


      for(var i=0;i<lenn;i++){        
        if(lenn==1){
          var str = req.body.subject_lec;
        var arr_lec = str.split(",");
    
          var obj = { 
          'sub_code':req.body.subject_code,
          'sub_name': req.body.subject_name,
          'sub_lecter': arr_lec,
          'sub_credit': req.body.subject_credit,
          'sub_type': req.body.subject_type,
          'sub_topic': req.body.subject_topic
          }
          
        }
        else{
          var str = req.body.subject_lec[i];
        var arr_lec = str.split(",");   
          var obj = {
            'sub_code':req.body.subject_code[i],
            'sub_name': req.body.subject_name[i],
            'sub_lecter': arr_lec,
            'sub_credit': req.body.subject_credit[i],
            'sub_type': req.body.subject_type[i],
            'sub_topic': req.body.subject_topic[i]               
          }
          
        }
        array.push(obj);
      }
      console.log(array); 
        
      async.eachSeries(array,function(item,outcback) {
          
          Subject.findOne( { $and: [
                 { 'sub_code' : item.sub_code },
                     { 'sub_lecter' : item.sub_lecter }
                    ]
            }, function (err, rows) {
            if(err){
              console.log("what happend"+err);
            }
            if(rows != null){
              console.log("This subject has already");
              console.log(rows);
              console.log(item);
              console.log(year_1);
              
              var obj = {
                'subcode' : rows._id,
                'enroll_num' : {
                  'year1': 0,
                  'year2' : 0,
                  'year3' : 0,
                  'year4' : 0
                }
              }                
              arrsub.push(obj);
              outcback(null);
            }
            else{
              //new Subject
              var newSubject = new Subject();
                newSubject.sub_code = item.sub_code;
                newSubject.sub_name = item.sub_name;
                newSubject.sub_credit = item.sub_credit;
                newSubject.sub_lecter = item.sub_lecter;  
                newSubject.sub_type = item.sub_type;
                newSubject.sub_topic = item.sub_topic;

                // save the subject
                    newSubject.save(function(err,sub) {
                        if (err){console.log('mhaiiiiiii'+err);}  
                        else{
                          console.log("Insert subject already"+sub)
                          
                    var obj = {
                      'subcode' : sub._id,
                      'enroll_num' : {
                        'year1': 0,
                        'year2' : 0,
                        'year3' : 0,
                        'year4' : 0
                      }
                    }                         
                 
                    arrsub.push(obj);
                          console.log(arrsub);
                          console.log(item.sub_lecter);

                          //CREATE SUBJECT ENROLL SCHEMA
                          Subenroll.findOne({ $and: [
                     { 'sub_code' : sub._id },
                         { 'acid' : req.body.acid }
                        ]
                   },function(err,suben){
                    if(err){console.log("find suben"+err);}
                    if(suben == null){
                      //new subject Enroll
                        var newsubEnroll = new Subenroll();
                          newsubEnroll.acid = req.body.acid;
                          newsubEnroll.sub_code = sub._id;
                        newsubEnroll.save(function(err,suben) {
                                if (err){console.log('suben'+err);}
                                else {
                                  console.log("Insert new subject Enroll already"+suben);                         
                                }
                            });
                    }
                   });
                          //FOR LOOP LECTURER
                           async.eachSeries(item.sub_lecter,function(index,incback) {
                       User.findOne( { '_id' :  index }, function (err, user) {
                          if(err){
                            console.log("err");
                          }
                          if(user != null){
                            console.log("This user have already");
                            console.log(typeof User);
                            console.log(typeof User.subjects);
                            console.log(sub._id);
                            //if user have already, push subject to user
                                user.subjects.push(sub._id);
                                user.save(function(err,user){
                                  if(err)console.log('user1'+err);
                                  else console.log('Update User already');
                                });

                                incback(null);
                          }
                          else{
                          //if there is no user 
                              // create the user
                              console.log(index);
                              var userobj = { 
                                '_id' : index,
                                'local': {
                                'username': index,
                          'name': index,
                          'program' : "",
                          'role': "staff"},
                          'subjects' : [sub._id] 
                          }
                        console.log(userobj);
                        //also add subject code to user
                              var newUser        = new User(userobj);                   
                              // save the user
                              newUser.save(function(err,user) {
                                  if (err){console.log('user2'+err);}
                                  else {
                                    console.log("Insert new User already"+user);
                                    incback(null);
                                  }
                              });
                            
                          }
                          
                        });         
                        
                        
                    },function(err) {
                        if (err) console.log("user path"+err);                        
                        console.log("User done");
                        outcback(null);
                    });     
                      
                    } 
                          
                      
                        
                    });         
            }

            
          });
          
      },function(err) {
          if (err) console.log("Teaching path"+err);
          console.log(arrsub);
          //Update teach year semester
          Teach.findOne({
             $and: [
                 { 'ac_id' : req.body.acid },
                     { 'Year' : req.body.year },
                     { 'semester' : req.body.semes },
                     {'plan':req.body.plan}
                   ]
            }, function(err, sub) {
                // console.log(nametemp);
                if (err){
            console.log("Error ...1: "+err);
          }
                // check to see if theres already a user with that email
                if (sub!= null) {
                  console.log(sub);
            console.log("That code is already have");
            sub.subject = arrsub;
            sub.save(function(err,teach) {
                      if (err){console.log('sub1'+err);}
                      else console.log("Insert already"+ teach);
                   });

                } else {
                    // if there is no user with that email
                    // create the user
                    var newTeach        = new Teach();

                    // set the user's local credentials
            newTeach.ac_id = req.body.acid ;
            newTeach.Year = req.body.year;
            newTeach.semester = req.body.semes;
            newTeach.subject = arrsub ; 
            newTeach.plan = req.body.plan;
            // save the user
                  newTeach.save(function(err,teach) {
                      if (err){console.log('sub2'+err);}
                      else console.log("Insert already"+ teach);
                  });
                    
                }
                
            });  
            




          res.redirect('/admin/showprogram?id='+req.body.acid+"&program="+req.body.program);
          console.log("done");
      });     
});

router.get('/delsubprogram',isLoggedIn,function(req,res){
    console.log("Delete Sub Program");
    console.log(req.query.id);
    //console.log(req.query.email);

    Teach.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('mhaiiiiiii');}
          else console.log(results);
          }
       );
    res.redirect('/admin/showprogram?id='+req.query.acid+"&program="+programreturn);  

});

//-----------------------------------Meeting -------------------------------------------------------------------------

router.get('/addmeeting',isLoggedIn,function(req,res){
    console.log('Admin get add new Meetings to program');
    console.log(req.query.acid);
    console.log(yearlevel);
    res.render("admin/faculty/program/meeting.hbs",{
      layout : "adminPage",
      user : req.user,
      acid : req.query.acid,
      yearlevel : yearlevel
    });
}); 

router.post('/addmeeting',isLoggedIn,function(req,res){
    console.log('Admin post add new Meetings to program');
    console.log(req.body.fromDate);
    console.log(req.body.acyear);
    console.log(req.body.participation);
    console.log(req.body.percentpart);
    Work.findOne( { 
      $and: [
                 { '_type' :  'meetingOfProgram' },
                 {  'Date' : req.body.fromDate }
           ]      
    }, function (err, rows) {
            if(err){
              console.log("Find meeting err"+err);
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
              'meetingDate': req.body.fromDate,
              '_type' : 'meetingOfProgram',            
              'acyear' :  req.body.acyear,
              'noOfParticipation' :  req.body.participation,
              'percentageOfParticipation' :  req.body.percentpart           
            }
          //also add subject code to user
              var newmeeting       = new Work.Meeting(workobj);                    
              // save the user
              newmeeting.save(function(err,meeting) {
                  if (err){console.log('new Meeting save'+err);}
                  else {
                    console.log("Save new meeting already"+meeting); 
                    res.redirect('/admin/showprogram?id='+req.body.acyear+"&program="+programreturn);                    
                    }
              });
              
              
            }
            
          });  
   
}); 

router.get('/editmeeting',isLoggedIn,function(req,res){
    var index =req.query.id;
    console.log("[Get]Admin Edit Meeting");
    console.log(req.query.id);
    console.log(req.query.acid);

    return Work.Meeting.findById(index, function( err, meeting ) {
        if( !err ) {
        console.log(meeting);
            res.render('admin/faculty/program/editmeeting.hbs', {
              layout: "adminPage",
              meeting: meeting ,
              acid: req.query.acid           
            });
        } else {
            return console.log( "query meeting err"+err );
          }
      }); 
});

router.post('/editmeeting',isLoggedIn,function(req,res){
    console.log("[Post]Admin Edit Meeting");
    console.log(req.body.acyear);
    console.log(req.body.workid);

    return Work.Meeting.findById(req.body.workid, function( err, meeting ) {
        if( !err ) {
        console.log(meeting);
          meeting.meetingDate = req.body.fromDate;
          meeting.noOfParticipation = req.body.participation;
          meeting.percentageOfParticipation = req.body.percentpart;
          // save the acyear
          meeting.save(function(err,meet) {
              if (err){console.log('cant save meeting'+err);}
                else{
                 console.log("Update meeting already"+ meet); 
                 res.redirect('/admin/showprogram?id='+req.body.acyear+"&program="+programreturn);                     
                }
            });

        } else {
            return console.log( "query meeting err"+err );
          }
      }); 
});
  
router.get('/delmeeting',isLoggedIn,function(req,res){
    console.log("Delete Meeting");
    console.log(req.query.id);
    console.log(req.query.acid);
    Work.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('delete meeting err'+err);}
          else console.log("delete already");
          }
       );
    res.redirect('/admin/showprogram?id='+req.query.acid+"&program="+programreturn);    
    
});

//subject section======================================================================================================================

router.use('/subjects',subjectControl ); //subjects 


//enroll section=======================================================================================================

router.get('/enroll',function(req,res){
    console.log("Get enroll section");
    console.log(req.query.acid);
    console.log(req.query.sub_id);
    console.log(req.query.year);
    console.log(req.query.semes);
    var countnum = 0;
    var countno = 0;
    var acyear_1,ac_year2 = 0;
    var id = mongoose.Types.ObjectId(req.query.sub_id);
    var acyear_1,acyear_2 = 0;
    var year_1,year_2,year_3 = ""
    var arr = {}
    console.log(id);
    //FIND YEAR
    Acyear.findById(req.query.acid , function(err, ac) {        
        if (err){
      console.log("Error ...1");
    }
        else {
           console.log("Find year from this");
         acyear_1 = ac.academic_year;
         acyear_2 = acyear_1-1;
          year_1 = acyear_1.toString();
          year_2 = acyear_2.toString();
          year_3 = "<"+year_2;
          year_4 = ">"+year_1;
         console.log("year1"+year_1+"year2"+year_2+"year3"+year_3);
          arr['year1'] = 0;
          arr['year2'] = 0;
          arr['year3'] = 0;
          arr['year4'] = 0;
          
         }
        });
        
       
        

    console.log(arr);
    Subenroll.aggregate([
        {
            $match: { $and: [
           { 'acid' : req.query.acid },
               { 'sub_code' : id }
              ]
         }
            
        },
       { 
          $unwind: "$student"
       },
       {
           $group: {
           _id: "$student.yearattend",
           count: { $sum: 1 },
           students: { $addToSet: "$student" }
     }

     }], function( e, result ) {
        if ( e ) return;
        async.eachSeries(result,function(item,callback) {  
          var beyear = item._id - 543;
          console.log(beyear);    
           Teach.findOne({
             $and: [
                 { 'ac_id' : req.query.acid },
                     { 'Year' : req.query.year },
                     { 'semester' : req.query.semes }
                   ]
            }, function(err, sub) {
                if (err){
            console.log("Teach find"+err);
          }
                // check to see if theres already a user with that email
                if (sub!= null) {
                  console.log(sub);
                  for(var i=0;i<sub.subject.length;i++){
                    if(sub.subject[i].subcode == req.query.sub_id){
                      
                      console.log(item.count);
                      if(beyear == acyear_1){
                        arr['year1'] = item.count;
                      }
                      else if(beyear == acyear_2){
                        arr['year2'] = item.count;
                      }
                      else if(beyear < acyear_2){
                        console.log(countnum);
                        countnum += item.count;
                        arr['year3'] = countnum;
                      }
                      else{
                        countno += item.count;
                        arr['year4'] = countno;
                      }
                      console.log(arr);
                      sub.subject[i].enroll_num = arr;
                sub.save(function(err,teach) {
                          if (err){console.log('sub1'+err);}
                          else {
                            console.log("Insert already"+ teach);
                            callback(null);}
                       });
                    }
                  }             
                  
                  }                 
              });  
          },function(err) {
              if (err) console.log('mhai_4');
              console.log("done");
              console.log(result);
                res.render('admin/faculty/subject/subjectenroll.hbs', {
                  layout: "adminPage",
            	  user : req.user,
                  enroll: result,
                  subid: req.query.sub_id,
                  acid : req.query.acid,
                  year : req.query.year,
                  semes : req.query.semes,
                  helpers: {
                  inc: function (value) { return parseInt(value) + 1; }
                }
             });
        });     
        
         
    });
});

router.get('/addenrollstd',function(req,res){
    console.log("Get addenroll student");
    console.log(req.query.subid);
    console.log(req.query.acid);
    console.log(req.query.year);
    console.log(req.query.semes);
    res.render('admin/faculty/subject/addenrollstd.hbs',{
      layout: "adminPage",
      user: req.user,
      subid: req.query.subid,
      acid: req.query.acid,
      year: req.query.year,
      semes: req.query.semes
    });
});

router.post('/addenrollstd',function(req,res){
    console.log("Post addenroll student");
    console.log("Posttt Add Subject");
    console.log(req.body.subid);
    console.log(req.body.acid);
    console.log(req.body.year);
    console.log(req.body.semes);
    //lec objects
    var lenn = req.body.arrlen;     
      var array = [];    
      var arrsub = []; 
      console.log(lenn);
      for(var i=0;i<lenn;i++){
        if(lenn==1){
          var obj = {
            'userid' : req.body.std_name,
            'grade': ""}
        }
        else{
          var obj = {
            'userid' : req.body.std_name[i],
            'grade': ""}    
        }
        array.push(obj);
      }
      console.log(array); 
      var id = mongoose.Types.ObjectId(req.body.subid);
    Subenroll.findOne({ $and:
          [
           { 'acid' : req.body.acid },
               { 'sub_code' : id }
              ]
      }, function(err, sub) {
            
            if (!err){
        console.log(sub);
        async.eachSeries(array,function(item,callback) { 
         User.findOne({'_id': item.userid},function(err,user){
          if(err){console.log("user find"+err);}

          if(user != null){
             var stdobj = {
                'yearattend' : user.local.yearattend,
                  'userid' : item.userid,
                  'grade': ""}
             sub.student.push(stdobj);
             sub.save(function(err,subj) {
                          if (err){console.log('sub enroll save'+err);}  
                          else{
                            console.log("Update subject enroll already"+subj)                         
                          }                         
                      });  
          }


         }); 

            
           Stdenroll.findOne( { 'userid' :  item.userid }, function (err, rows) {
                if(err){
                  console.log("std enroll"+err);
                }
                if(rows != null){
                  console.log("This user have already");
                  console.log(rows);
                  console.log(item);

                  //if user have already, set ref of subject to user enroll
              var subobj = {
                  'sub_code' : req.body.subid,
                  'grade': ""
                  }             
                  rows.subjects.push(subobj);
                  rows.save(function(err,sub) {
                          if (err){console.log('std enroll save1'+err);}  
                          else{
                            console.log("Update std enroll already"+sub)                          
                          }                         
                      });

                      callback(err);
                }
                else{
                //if there is no user 
                    // create the user
                    var subobj = { 
                      'userid': item.userid,
                'acid': req.body.acid ,
                'year': req.body.year,
                'semester': req.body.semes,
                'subjects' : [{
                  'sub_code' : req.body.subid,
                  'grade' : ""
                  }]
                }
              //also add subject code to user
                    var stdEnroll        = new Stdenroll(subobj);                   
                    // save the user
                    stdEnroll.save(function(err,user) {
                        if (err){console.log('std enroll save2'+err);}
                        else {
                          console.log("Insert new User already"+user);
                          callback(err);
                        }
                    });
                  
                }
                
              });           
          },function(err) {
              if (err) console.log('Async enroll err');
              res.redirect('/admin/enroll?sub_id='+req.body.subid+'&acid='+req.body.acid+'&year='+req.body.year+'&semes='+req.body.semes);
              console.log("done");
          });

      }
      else {
        console.log("Sub enroll find err"+err);
      }


        }); 
});



//---------------------------------------------------ELO OF EAACH SUBJECT-------------------------------------------------------------------

router.get('/sub_elo',function(req,res){
    console.log("Get addenroll student");
    console.log(req.query.sub_id);
    console.log(req.query.acid);
    console.log(req.query.year);
    console.log(req.query.semes);


    Acyear.findOne({ '_id':  req.query.acid   }, function (err, program) {

      console.log("program-------------------->:"+program);

      Subject.ELO.find( {
        $and: [
               { 'eloFromTQF': { $exists: true } },
               { 'program': program.program_name }
              ]
        },function( err, elo ) { 

          console.log("ELO-------------------->:"+elo);
          console.log("ELO-------------------->:"+elo.length);
          res.render('admin/faculty/subject/sub_add_elo.hbs',{
            layout: "adminPage",
            user: req.user,
            sub_id: req.query.sub_id,
            acid: req.query.acid,
            year: req.query.year,
            semes: req.query.semes,
            sub_name:req.query.sub_name,
            sub_code:req.query.sub_code,
            sub_credit:req.query.sub_credit,
            elo:elo,
            len:elo.length
          });
      });
    });
});


router.post('/sub_elo',function(req,res){
    console.log("Post addenroll student");
    console.log(req.query.sub_id);
    console.log(req.query.acid);

    console.log("req.query.subid-------------------->:"+req.query.sub_id);

    Subject.findOne({ '_id':  req.query.sub_id  }, function (err, subject) {

      console.log("subject-------------------->:"+subject);


      var strlen = req.body.arrlen; 

      console.log("strlen-------------------->:"+strlen);
    
      var array = [];
      var keepnameReq;
      var check = 0;
      var check_duplicate = 0;
      var obj = {}
      
      console.log('ARRAY ----req.body.elo--- >'+req.body.elo);
      console.log('ARRAY ----req.body.elo--- >'+req.body.supportlevels);
      
      for(var i=0;i< strlen;i++){
        
          console.log('ARRAY ----req.body.elo[i]--- >'+req.body.elo[i]);
          console.log('ARRAY ----req.body.supportlevels[i]--- >'+req.body.supportlevels[i]);

          obj = {"ELO":req.body.elo[i],"supportLevel":req.body.supportlevels[i]};
          array.push(obj);

      }

      console.log('ARRAY -------- >'+array);  


      Subject.findOne({
          "_id":req.query.sub_id
      }, function(err, subject) {        
        
          console.log("EDIT-------------------->:"+subject)
          console.log('ARRAY ---EDITTTT---- >'+array);
                    
            Subject.update(
                        {"_id":req.query.sub_id}, 
            { $unset: { 'ELO': "" } }
            
          , function(err, delete_elo_program) { 

            if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          console.log('DELETE ELO TO SUBJECT SUCCESSFUL : '+delete_elo_program)
                          

                          Subject.update(
                        {"_id":req.query.sub_id}, 
                        { $set:  {"ELO": array }}
                      , function(err, add_stk_program) { 

                        if (err){console.log('cant edit new program Management'+err);}  
                        else{

                          console.log('ADD ELO TO SUBJECT SUCCESSFUL : '+add_stk_program)
                          dialog.info('Add ELO to subject successful :)');
                          Acyear.findOne({
                              '_id':req.query.acid
                          }, function (err, acc) {
                            console.log('ACC : '+acc)
                          res.redirect('/admin/subjects/showsubject?acid='+req.query.acid+'&program='+acc.program_name+'&acyear='+acc.academic_year);
                          });

                        }

                        }); 

                        }
          
                      
                      }); 
          });      
     

      
    });
});











module.exports = router;


