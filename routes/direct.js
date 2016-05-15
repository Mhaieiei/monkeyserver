//var Handler   = require('./handler');
var path = require('path');
var fs = require('fs');
var exphbs = require('express3-handlebars');
var async = require('async');
var mongoose = require('mongoose');
//var busboy = require('connect-busboy');
var Handlebars = require('handlebars/runtime')['default'];
var isLoggedIn = require('middleware/loginChecker');

var adminController     = require('lib/adminHandler');
var thesisController    = require('lib/works/thesisHandler');
var publicController    = require('lib/works/publicHandler');
var trainController    = require('lib/works/trainHandler');
var careerController    = require('lib/works/careerHandler');

var formController      = require('./wf/form');
var workflowController  = require('./wf/workflow');
var executionController = require('./wf/execution');
var serviceController   = require('./wf/service');
var roleManagementController = require('../lib/roleManagement');

var tqfController       = require('lib/tqfHandler');
var aunController       = require('lib/aunHandler');

var request = require('request');

Handlebars.registerHelper('select', function( value, options ){
        var $el = $('<select />').html( options.fn(this) );
        $el.find('[value="' + value + '"]').attr({'selected':'selected'});
        return $el.html();
    });

// Handlebars.registerHelper('select', function(selected, options) {
//     return options.fn(this).replace(
//         new RegExp(' value=\"' + selected + '\"'),
//         '$& selected="selected"');
// });


  // =====================================
    // Setting Workflow ========
    // =====================================
var parseString     = require('xml2js').parseString;
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];

var date = new Date();
var current_year = date.getFullYear();
var index = 0;
var nametemp = "";

module.exports = function(app, passport) {
  // =====================================
    // Setting Model Databases ========
    // =====================================
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
  
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    //app.get('/', function(req, res) {
      //res.render('signin.ejs');
    //    res.render('signin.hbs',{layout:"main"}); // load the sigin.ejs file
    //});
  
  // Get path images
  app.get('/image.png', function (req, res) {
        //res.sendfile(path.resolve('uploads/acnes.png'));
      res.sendfile(path.resolve('uploads/image_'+req.user._id+'.jpg'));
  });
  app.get('/imagelogo.jpg', function (req, res) {
        res.sendfile(path.resolve('public/images/monkey.jpg'));
  });
  app.get('/db.jpg', function (req, res) {
        res.sendfile(path.resolve('public/images/db.jpg'));
  });
  app.get('/qa.jpg', function (req, res) {
        res.sendfile(path.resolve('public/images/qa.jpg'));
  });
  app.get('/wf.jpg', function (req, res) {
        res.sendfile(path.resolve('public/images/wf.jpg'));
  });
  
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/', function(req, res) {

        // render the page and pass in any flash data if it exists     
        res.render('index.ejs', { message: req.flash('loginMessage') }); 
    });

    // app.get('/login', function(req, res){
    //  res.render('index.ejs', { message: req.flash('loginMessage') }); 
    // });

    // process the login form
    // app.post('/login', do all our passport stuff here);
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    
    }));
    // =====================================
    // LOGOUT ==============================
    // =====================================

    app.get('/logout', function(req, res) {
    console.log("Get logout");
        req.logout();
        res.redirect('/');
    });
  
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: 'signupMessage' });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
  app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
  
    // =====================================
    // Get User Info. ==============================
    // =====================================

	app.get('/profile_inf',isLoggedIn,function(req,res){
		console.log("Get profile information");	
		var role = req.query.role;
		console.log(role);
		if(role == "student"){
			res.render('profile/student_profile.hbs',{
			layout:"profilestudent",
			user : req.user

			});
		}
		else{
			res.render('profile/staff_profile.hbs',{
			layout:"profilePage",
			user : req.user

			});
		}
		
		
	});
	app.get('/profile_inf_admin',isLoggedIn,function(req,res){
		console.log("Get profile information");	
		return User.findOne({'local.username': req.query.user}, function( err, user ) {
	        if( !err ) {
	        	console.log(user);
	        	console.log(user.local.username);
	        	//console.log(Object.entries(user.local));
	        	console.log(user.local.role);
	     if(user.local.role == "student"){
					res.render('profile/student_profile.hbs', {
						layout: "profileAdstudent",
						user : user
					});
				}
				else{
					res.render('profile/staff_profile.hbs', {
						layout: "profileAdmin",
						user : user
					});
				}
	        } else {
	            return console.log( err+"mhaieiei" );
		        }
		    });
		
		
		
	});
	// =====================================

  app.get('/profile_inf',isLoggedIn,function(req,res){
    console.log("Get profile information"); 
    var role = req.query.role;
    console.log(role);
    if(role == "student"){
      res.render('profile/student_profile.hbs',{
      layout:"profilestudent",
      user : req.user

      });
    }
    else{
      res.render('profile/staff_profile.hbs',{
      layout:"profilePage",
      user : req.user

      });
    }
    
    
  });
  app.get('/profile_inf_admin',isLoggedIn,function(req,res){
    console.log("Get profile information"); 
    return User.findOne({'local.username': req.query.user}, function( err, user ) {
          if( !err ) {
            console.log(user);
            console.log(user.local.username);
            //console.log(Object.entries(user.local));
            console.log(user.local.role);
            if(user.local.role == "student"){
          res.render('profile/student_profile.hbs', {
            layout: "profileAdstudent",
            user : user
          });
        }
        else{
          res.render('profile/staff_profile.hbs', {
            layout: "profileAdmin",
            user : user
          });
        }
          } else {
              return console.log( err+"mhaieiei" );
            }
        });
    
    
    
  });
  // =====================================

    // Edit Profile ========
    // =====================================
    
      // edit user profile
    app.get('/adminedit', isLoggedIn, function(req, res) {
      console.log( "Get Admin editprofile");
      console.log(req.query.user);
      var username = req.query.user;

      return User.findOne({'local.username': username}, function( err, user ) {
          if( !err ) {
            console.log(user);
            console.log(user.local.username);
            //console.log(Object.entries(user.local));
            console.log(user.local.role);
            if(user.local.role == "student"){
          res.render('profile/student_profileedit.hbs', {
            layout: "profileAdstudent",
            user : user
          });
        }
        else{
          res.render('profile/staff_profileedit.hbs', {
            layout: "profileAdmin",
            user : user
          });
        }
          } else {
              return console.log( err+"mhaieiei" );
            }
        });
      

    });

    // edit user profile
    app.get('/edit', isLoggedIn, function(req, res) {
      console.log( "Get editprofile");
      console.log(req.query.user);
      var username = req.query.user;

      return User.findOne({'local.username': username}, function( err, user ) {
          if( !err ) {
            console.log(user);
            console.log(user.local.username);
            //console.log(Object.entries(user.local));
            console.log(user.local.role);
            if(user.local.role == "student"){
          res.render('profile/student_profileedit.hbs', {
            layout: "profilePage",
            user : user
          });
        }
        else{
          res.render('profile/staff_profileedit.hbs', {
            layout: "profilePage",
            user : user
          });
        }
          } else {
              return console.log( err+"mhaieiei" );
            }
        });
      

    });

    
    app.post('/edit',isLoggedIn, function (req, res){
      console.log( "Post editprofile");
      console.log(req.body.username);
      //console.log(req.files.file.path)
      user : req.user
      //if(req.busboy){
        /*console.log('Nothingg happend');
        //console.log(req.busboy);
        var fstream;
        //var busboy = new Busboy({headers: "Mhai eiei"});
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
          console.log("Uploading: " + filename); 
          fstream = fs.createWriteStream(path.resolve('uploads/image_'+req.user._id+'.jpg'));
          console.log(fstream);
          file.pipe(fstream);
          fstream.on('close', function(err) {
            if (err){ console.log("Error Can't upload");}
            console.log("Upload completed!");
            res.redirect('/profile_inf');
          });
        });*/
      //}
      
    /*var tempPath = req.files.file.path,
      targetPath = path.resolve('uploads/'+req.files.file.originalFilename);
    var fstream;
    console.log(tempPath);
    if (path.extname(req.files.file.name).toLowerCase() === '.png') {
      fs.rename(tempPath, 'uploads/image_'+req.user._id, function(err) {
          if (err){ console.log("Error Can't upload");}
        else{console.log("Upload completed!");}
      });
    }*/
    User.findOne({'local.username' : req.body.username }, function(err, user) {
          if (err){ 
            console.log("Upload Failed!");
            return done(err);}
          
          if (user){
              console.log(user);
              console.log("eiei");
              user.updateUser(req, res)
              
          }

      });
      
      
    });
 //=====================================
    // Get Education Info. ==============================
    // =====================================

  app.get('/education_inf',isLoggedIn,function(req,res){
    console.log("Get education");
    console.log(req.query.name);
    if(req.query.name != null){
      user = req.query.name;
      nameid = req.query.name;
    }else{
      user = req.user;
      nameid = req.user.id;
    }
    console.log(user);
    User.findOne({'_id': nameid}, function( err, user ) {
          if( !err ) {
            console.log(user);
            res.render('profile/educationinfo.hbs', {
                layout: "profilePage",
                user : user, // get the user out of session and pass to template
                helpers: {
                inc: function (value) { return parseInt(value) + 1; },
                getname: function () { return nameid; },

            }     
          });
          } else {
              return console.log( "Cant query education"+err );
            }
     });
    
  });
  


  //add education_inf
  app.get('/addedu',isLoggedIn,function(req,res){
    console.log("Add Education");
    console.log(req.query.user);
    res.render('profile/addeducation.hbs', {
             layout: "profilePage",
            username : req.query.user // get the user out of session and pass to template     
        });
  });
  
  app.post('/addedu',isLoggedIn,function(req,res){
    console.log("[Post] add education");
    var id = req.body.level+req.body.year;
    console.log(id);

    User.update({ 'local.username' : req.body.username },
    {

     "$push" : {
      "education" :  {
            "id" : id,
           "level": req.body.level,
           "degree": req.body.degree,
           "university": req.body.university,
           "year": req.body.year
           } //inserted data is the object to be inserted 
        }
      },{safe:true},
        function (err, user) {
        if (err){console.log('Cant push new education');}
          else console.log("Push new education already"+user);
    });
    res.redirect('/education_inf?name='+req.body.username);
        
  });

  //edit education information.
  app.get('/editeducation',isLoggedIn,function(req,res){
    var index =req.query.id;
    console.log("Get Edit education");
    console.log(req.query.id);
    var nameid = req.query.user;
    User.findOne({'_id' : nameid }, function(err, user) {
          if (err){ console.log("Upload Failed!");}
          res.render('profile/editedu.hbs', {
            layout: "homePage",
            username : nameid,
            index : index,
            education : user.education[index]
          });

    });
      
  });

  app.post('/editedu',isLoggedIn,function(req,res){
    console.log("Edit education");
    console.log(req.query.id);
    console.log(req.body.level);
    //user : req.user   
    
      
    User.findOneAndUpdate({ _id : req.body.username,'education.id': req.body.eduid},
    {
     "$set" : {
            'education.$.level': req.body.level,
            'education.$.degree': req.body.degree,
            'education.$.university': req.body.university,
            'education.$.year': req.body.year

        }
      },function (err, useredit) {
        if (err){console.log('Cant delete education of user'+err);}
        else {console.log('Delete education of user already'+ useredit.local.name);}
    });
    res.redirect('/education_inf?name='+req.body.username);
    
  });
  //delete education information.
  app.get('/deledu',isLoggedIn,function(req,res){
    console.log("Delete Education");
    console.log(req.query.user);
    User.findOneAndUpdate({ '_id' : req.query.user },
    {
     "$pull" : {
      "education" :  {
           "id": req.query.id
          } //inserted data is the object to be inserted 
        }
      },function (err, useredit) {
        if (err){console.log('Cant delete education of user'+err);}
        else {console.log('Delete education of user already'+ useredit.local.name);}
    });
    res.redirect('/education_inf?name='+req.query.user);
    
    
  });
 // =====================================
 // =====================================

  // Admin SECTION =====================
  // =====================================
 app.use('/admin', adminController );

  
 //=====================================
    // Get QA Info. ==============================
    // =====================================
    app.get('/qapage',function(req,res){
      console.log('Get QA Info(select program)');
      console.log(years);
      //console.log(years[0]);
      return Fac.find( {},function( err, faculty ) {
        if( !err ) {
      console.log(faculty); 
            res.render("qa/qa.hbs", {
              layout: "homePage",
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

  app.post('/qahome',function(req,res){
    console.log('Get QA home(select Topic)');
    console.log(req.body.sub_programs);
    console.log(req.body.years);

    return Acyear.findOne({
       $and: [
              { 'program_name' : req.body.sub_programs },
              { 'academic_year' : req.body.years }
            ]
     }, function( err, programs ) {
      if(err){console.log('program err'+err);}
      else{
        console.log(programs);
        res.render('qa/qahome.hbs',{
      layout: "qaPage",
      user: req.user,
      programname: req.body.sub_programs,
      year: req.body.years,
      acid : programs._id,
     
      });
    } 
  });
});

app.use('/tqf', tqfController ); //tqf handler
app.use('/aun', aunController ); //aun handler

//----------------------------------------------------------------------------------------------------------------------------
  //=====================================
  // Get Work Info.(Student) ==============================
  // =====================================

  
  app.use('/thesisinf', thesisController );     //thesis 
  app.use('/publicationinf', publicController ); //publication  
  app.use('/traininf',trainController);  //Training Courses
  app.use('/careerinf',careerController);  //Career Development

    
  //==== workflow module =========

  app.use('/workflow', workflowController );
  app.use('/execution', executionController );
  app.use('/form', formController);
  app.use('/service', serviceController );
	app.use('/roleManagement',roleManagementController);
  //==== end workflow module =========

	//=====================================
	// DMs. ==============================
	// =====================================

  app.post('/getdoc',function(req,res){
    console.log('Post Document');
    var doc_name = req.body.doc_name;
    var doc_author = req.body.doc_author;
    var doc_status = req.body.doc_status;
    console.log(JSON.stringify(req.body));
    // console.log("test date ",req.body['fromDate']);
    console.log("test status ",req.body['doc_status']);
    console.log("test get date",req.body['toDate']);
    console.log('req.body.doc_name', req.body['doc_name']);
    res.render('dms/getdoc.hbs',{
        layout: "homePage"
      });
  });

  //=====================================
  // API. ==============================
  // =====================================

  

};

//route middleware to make sure user is logged in as Admin
function isAdmin(req,res,next){

  if(req.user.local.name == "admin")
    return next();

  res.redirect('/');
}

