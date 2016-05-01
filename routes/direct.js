//var Handler   = require('./handler');
var path = require('path');
var fs = require('fs');
var exphbs = require('express3-handlebars');
var async = require('async');
var mongoose = require('mongoose');
//var busboy = require('connect-busboy');
var Handlebars = require('handlebars/runtime')['default'];
var isLoggedIn = require('middleware/loginChecker');

var adminController     = require('../lib/admin');
var thesisController    = require('../lib/thesisHandler');
var publicController    = require('../lib/publicHandler');
var trainController    = require('../lib/trainHandler');

var formController      = require('./wf/form');
var workflowController  = require('./wf/workflow');
var executionController = require('./wf/execution');
var serviceController   = require('./wf/service');
var roleManagementController = require('../lib/roleManagement');

var tqfController       = require('../lib/tqfHandler');
var aunController       = require('../lib/aunHandler');

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
var WorkflowHandler   = require('./WorkflowHandler');
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
    // HOME SECTION =====================
    // =====================================
       app.get('/home', isLoggedIn, function(req, res) {
        
        var query = Doc.findByUser(req.user);
        var date= [];
        query.exec(function(err,_docs) {
          if(err) {
            console.log(err);
            res.status(500);
            return next(err);

          }

          var response = {
            layout: 'homePage',
            docs: _docs,
            helpers: {
                  getdate: function (value) { return date[value]; }
                }
            
          }
            
              
            
            for(var i = 0 ; i < _docs.length ;++i){
              var a = _docs[i].dateCreate;
              var yy = a.getFullYear();
              var mm = a.getMonth()+1;
              var dd = a.getDate();
              
              if(mm<10){
                mm = "0"+mm;
              }
              if(dd<10){
                dd = "0"+dd;
              }
              
              date[i] = dd+ '/' +mm +'/'+ yy;
            }
            
            //response.docs[0].dateCreate =  a.getYear() + '/' +a.getMonth() +'/'+a.getDay()
            
            console.log("update")
            res.render('home.hbs',{
          layout: 'homePage',
              docs: _docs,
                helpers: {
                  getdate: function (value) { return date[value]; }
                }
        });
            
        
          
            
          
          
        });

        

  

  
    });

    app.post('/home', isLoggedIn, function(req, res) {
      console.log('AT HOME');
      var date= [];
      var documentName = req.body.doc_name;
      var status = req.body.doc_status;
      var fromDate = Date.parse(req.body.fromDate);
      var fDate = req.body.fromDate;
      var toDate = Date.parse(req.body.toDate);
      var tDate = req.body.toDate;
      var type = req.body.doc_type;
      var author = req.body.doc_author;
      var user = req.user;

      var subStringRegex = function(subString, isCaseSensitive) {
        var mode;
        if(isCaseSensitive) mode = 'c';
        else mode = 'i';

        return new RegExp(subString, mode);
      };
      
      var query = Doc.findByUser(user).
      where('name').regex(subStringRegex(documentName, false));

      if(!isNaN(fromDate) && !isNaN(toDate)) {
        fromDate = new Date(fromDate);
        toDate = new Date(toDate);
        query = query.where('dateCreate').gt(fromDate).lt(toDate);
      }

      if(author) {
        query = query.where('author').regex(subStringRegex(author, false));
      }

      if(status !== 'all') {
        status = status.toLowerCase().trim();
        query = query.where('status').equals(status);
      }

      console.log("Status:"+status);

      query.exec(function(err, _docs) {
          if(err) {
            console.log(err);
            res.status(500);
            return next(err);
        }

      console.log("Type: " + type);
      var status1;
      var status2;
      var status3;
      var type1;
      var type2;

      if (status == 'create') {
        status1 = true;
      } else if (status == 'inprogress'){
        status2 = true;
      } else if (status == 'done'){
        status3 = true;
      }

      if (type == 'own'){
        type1 = true;
      } else if (type == 'other_type'){ 
        type2 = true;
      }

      console.log('s1:'+status1);
      console.log('s2:'+status2);
      console.log('s3:'+status3);
      console.log('type1:'+type1);
      console.log('type2:'+type2);
      var response = {
            layout: 'homepage',
            docs: _docs,
             docName: documentName,
            docAuthor: author,
            docStatus: status,
            docFromDate: fDate,
            docToDate: tDate,
            docType: type,
            st1: status1,
            st2: status2,
            st3: status3,
            type1: type1,
            type2: type2,
             helpers: {
                getdate: function (value) { return date[value]; }
            }
        }
        
          for(var i = 0 ; i < response.docs.length ;++i){
            var a = response.docs[i].dateCreate;
            var yy = a.getFullYear();
            var mm = a.getMonth()+1;
            var dd = a.getDate();
            
            if(mm<10){
              mm = "0"+mm;
            }
            if(dd<10){
              dd = "0"+dd;
            }
            
            date[i] = dd+ '/' +mm +'/'+ yy;
          }
      
      res.render('home.hbs', response); 
      });
   });

    app.get('/document', isLoggedIn, function(req, res){
      console.log("Document Information");
      res.render('dms/document.hbs');
    });

       app.post('/home', isLoggedIn, function(req, res) {

        console.log('AT HOME');
      var documentName = req.body.doc_name;
      var status = req.body.doc_status;
      var fromDate = Date.parse(req.body.fromDate);
      var toDate = Date.parse(req.body.toDate);
      var type = req.body.doc_type;
      var author = req.body.doc_author;
      var user = req.user;
      console.log(documentName);
      console.log(status);
      console.log(fromDate);
      console.log(toDate);
      console.log(type);
      console.log(author);


      var subStringRegex = function(subString, isCaseSensitive) {
        var mode;
        if(isCaseSensitive) mode = 'c';
        else mode = 'i';

        return new RegExp(subString, mode);
      };
      
      var query = Doc.findByUser(user).
      where('name').regex(subStringRegex(documentName, false));

      if(!isNaN(fromDate) && !isNaN(toDate)) {
        fromDate = new Date(fromDate);
        toDate = new Date(toDate);
        query = query.where('dateCreate').gt(fromDate).lt(toDate);
      }

      if(author) {
        query = query.where('author').regex(subStringRegex(author, false));
      }

      if(status !== 'all') {
        status = status.toLowerCase().trim();
        query = query.where('status').equals(status);
      }
          
      query.exec(function(err, _docs) {
          if(err) {
            console.log(err);
            res.status(500);
            return next(err);
        }
        console.log(_docs);
      var response = {
            layout: 'homepage',
            docs: _docs
        }
      
      res.render('home.hbs', response); 
      });

   });

    
      
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
app.use('/aun', aunController ); //tqf handler

    


  
  app.get('/aun10-1', isLoggedIn, function (req, res) {
      console.log("FacilityAndInfrastrutureSchema");  
      var acyear = req.query.acid;   
      FacilityAndInfrastruture.find({ 'programAndAcYear': req.query.acid }, function (err, docs) {
          if(err) console.log("aun10_1 query err"+err);
          console.log("REFFFF---->>>", docs);
          res.render('qa/qa-aun10.1.hbs', {
            //    user: req.user,      
            layout: "qaPage",
            docs: docs,
            acid : req.query.acid,
            helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getacyear: function () { return acyear; }
            } 
        });
    });            

  });

 
  app.get('/aun5-3', isLoggedIn, function (req, res) {
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
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         getyear:function(value) {return yearac[value];},
                         getindex:function() {return ++index;}}

                 });

                 });
        }
        else{

          console.log("program dose not exist");

          // res.redirect('/qapage');




          // res.render('qa/qa-aun5.3.hbs', {
          //            //    user: req.user,      
          //            layout: "qaPage",
          //            program:docs._id,
          //            docs: result,
          //            helpers: {
          //                inc: function (value) { return parseInt(value) + 1; },
          //                getyear:function(value) {return yearac[value];},
          //                getindex:function() {return ++index;}}

          //        });




        }
      });
                
  });

  

  app.get('/aun11-4', isLoggedIn, function (req, res) {
      console.log("evaluationMethod");

      //referenceCurriculumSchema.find();


      Program.find({ 'programname': req.query.program })
             .populate('evaluation.stakeholder')
             .populate('evaluation.EvaluationMethod')
             .exec(function (err, docs) {



                 console.log("REFFFF---->>>", docs);
                 var index = 0;
                 res.render('qa/qa-aun11.4.hbs', {
                     //    user: req.user,      
                     layout: "qaPage",

                     docs: docs,
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         getyear: function (value) { return yearac[value]; },
                         getindex: function () { return ++index; }
                     }

                 });




             });


  });

 
  
  app.get('/aun7', isLoggedIn, function (req, res) {
      console.log("listOfSupportStaff");

      //referenceCurriculumSchema.find();


      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              Role.roleOfStaff.find({
                  $and:[{

                      "type": "Supporting Staff"},
                        { "academicYear": req.query.year },
                                        { "program": req.query.program }
                  ]
              })
                .populate('user')
                .exec(function (err, docs) {


                    console.log("REFFFF---->>>", docs);

          var index = 0;
          var count = 0;
          res.render('qa/qa-aun7.hbs', {
              //    user: req.user,      
              layout: "qaPage",

              docs: docs,
              helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getyear: function (value) { return yearac[value]; },
                  getindex: function () { return ++index; },
                  getcount: function () { return ++count; },
                  getRetired: function (value) { return 60 - parseInt(value); },
                  getAcYearOfRetired: function (value) { return parseInt(req.query.year) + (60 - parseInt(value)); },
                  getTerminate: function (value) { return parseInt(value) - parseInt(req.query.year); }
          
              }

          });


                });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });

  });

  app.get('/aun12-1', isLoggedIn, function (req, res) {
      console.log("careerDevelopment");
      console.log("Academictitle");

      //referenceCurriculumSchema.find();
      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {

              console.log("REFFFF---->>>", programs.id);
              Work.CareerDevelopment.aggregate([
                    {
                        $match: {
                            $and: [
                                { 'activity': { $exists: true } },
                                //{ 'hour': 5 }
                                { 'academicYear': programs.id }
                            ]
                        }
                    },

                    { $group: { _id: "$user", careerDevelopment: { $push: "$$ROOT" } } }


              ], function (e, result) {
                  //console.log("REFFFF--activity-->>>", result);

                  User.populate(result, {
                      path: '_id',
                      model: 'User'
                  },
                         function (err, subs) {



                             console.log("REFFFF--USERR----activity-->>>", subs);

                            

                            Role.aggregate(

                            [
                              {
                                  $match: {
                                      $and: [
                                      { 'type': 'Academic Staff' },
                                      { 'program': req.query.program },
                                      {'position': 'Faculty Member'}

                                      ]
                                  }
                              },
                              {
                                $unwind:  "$user"    
                              },

                              { 
                                $group : { 
                                  _id : {academicYear:"$academicYear"},
                                  
                                  count: { $sum: 1 }
                              }

                              }

                              ],
                         function (err, noOfProgarm) {

                             console.log("REFFFF--USERR----noOfProgarm-->>>", noOfProgarm);

                             Role.aggregate(
                                [
                            {
                                $match: {
                                    $and: [
                                    { 'type': 'Academic title' },
                                    { 'program': req.query.program },
                                    {'role':'Faculty Member'}

                                    ]
                                }
                            },
                            {
                        $unwind:  "$user"    
                    },

                            { 
                      $group : { 
                        _id : {academicYear:"$academicYear" ,title:"$title"},
                        
                        count: { $sum: 1 }
                      }

                  },
                  { 
                      $group : { 
                        _id : "$_id.academicYear",
                        user: { $push: "$$ROOT" }
                        
                      }

                  }

                           
                                ],
                         function (err, noOfAcademicTitle) {

                             console.log("REFFFF--USERR----noOfAcademicTitle-->>>", noOfAcademicTitle);
                             
                                     console.log("REFFFF--programs._id-->>>", programs._id);
                                     
                             Role.roleOfStaff.aggregate(
                                             [
                                         {
                                             $match: {
                                                 $and: [
                                                     { "type": "Academic Staff" },
                                                    {"position": "Faculty Member"},
                                                     { "academicYear": req.query.year },
                                        { "program": req.query.program }
                                                    

                                                 ]

                                             }
                                         }]
                                         , function (err, staff) {
                                          // console.log("REFFFF----Faculty----Academic Staff>>>", staff);

                                             Program.populate(staff, {
                                                 path: 'user',
                                                 model: 'User'
                                             },

                                         function (err, user) {

                                          // console.log("REFFFF----Faculty----Academic Staff---pop-user>>>", user);

                                             Program.populate(user, {
                                                 path: 'user.training',
                                                 model: 'training'
                                             }, function (err, usertraining) {

                                              // console.log("REFFFF----Faculty----Academic Staff--usertraining->>>", usertraining);
                                                 Program.populate(usertraining, {
                                                 path: 'user.training.academicYear',
                                                 model: 'Acyear'
                                             }, function (err, usertraining_acYear) {
                                                 console.log("REFFFF----Faculty----Academic Staff--usertraining---academicYear>>>", usertraining_acYear);



                        
                                                 
                                                             

                                                             res.render('qa/qa-aun12.1.ejs', {
                                                                //    user: req.user,      
                                                                layout: "qaPage",

                                                                training: usertraining_acYear,
                                                                academicTitle:noOfAcademicTitle,
                                                                noOfStaff:noOfProgarm,
                                                                careerDevelopment:subs,
                                                                academicYear:req.query.year,

                                                                helpers: {
                                                                    inc: function (value) { return parseInt(value) + 1; },
                                                                    getyear: function (value) { return yearac[value]; },
                                                                    getindex: function () { return ++index; }
                                                                }
                                                             });

            
                                                   });      
                                          
                                         });
                                         });
                                    
                                 
                             });
                             


                         });
                         });
             
                         });
              });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });



  });

  app.get('/aun12-2', isLoggedIn, function (req, res) {
      console.log("careerDevelopment");
      console.log("Academictitle");


      
      Role.aggregate(

        [
          {
              $match: {
                  $and: [
                  { 'type': 'Supporting Staff' },
                  { 'program': req.query.program }

                  ]
              }
          },
          {
            $unwind:  "$user"    
          },

          { 
            $group : { 
              _id : {academicYear:"$academicYear"},
              
              count: { $sum: 1 }
          }

          }

          ],function (err, noOfProgarm) {

               console.log("REFFFF--Staff----noOfProgarm-->>>", noOfProgarm);

               Role.aggregate(
                  [
              {
                  $match: {
                      $and: [
                      { 'type': 'Advancement of career title' },
                      { 'program': req.query.program }

                      ]
                  }
              },
              {
          $unwind:  "$user"    
            },

                    { 
              $group : { 
                _id : {academicYear:"$academicYear" ,title:"$title"},
                
                count: { $sum: 1 }
              }

          },
          { 
              $group : { 
                _id : "$_id.academicYear",
                user: { $push: "$$ROOT" }
                
              }

          }

              
                  ],
           function (err, noOfStaffTitle) {

               console.log("REFFFF--Staff----noOfProgarm-->>>", noOfStaffTitle);

               Acyear.findOne({
                   $and: [
                          { 'program_name': req.query.program },
                          { 'academic_year': req.query.year }
                   ]
               }, function (err, programs) {
               Role.roleOfStaff.aggregate(
                               [
                           {
                               $match: {
                                   $and: [
                                       { "type": "Supporting Staff" },
                                      
                                       { "academicYear": req.query.year },
                          { "program": req.query.program }

                                   ]

                               }
                           }]
                           , function (err, staff) {
                               Program.populate(staff, {
                                   path: 'user',
                                   model: 'User'
                               },
                           function (err, user) {

                               Program.populate(user, {
                                   path: 'user.training',
                                   model: 'training'
                               }, function (err, usertraining) {
                                   Program.populate(usertraining, {
                                   path: 'user.training.academicYear',
                                   model: 'Acyear'
                               }, function (err, usertraining_acYear) {
                                   console.log("REFFFF----Faculty----Supporting Staff--usertraining->>>", usertraining_acYear);
                                   var index = 0;
                                   res.render('qa/qa-aun12.2.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",

                            docs: usertraining_acYear,
                            noOfStaffTitle:noOfStaffTitle,
                            noOfStaff:noOfProgarm,
                            helpers: {
                              inc: function (value) { return parseInt(value) + 1; },
                              getyear: function (value) { return yearac[value]; },
                              getindex: function () { return ++index; }
                          }

                         });



          });
                               });
                           });


                           });
               });
           });
           });


  });

  
  app.get('/aun8-3', isLoggedIn, function (req, res) {
      console.log("nationalityOfStudent");

      //referenceCurriculumSchema.find();
        
       User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program }

                            ]

                        }
                    },

                    {
                        $group: {
                            _id: { yearAttend: "$local.yearAttend", nationality: "$local.nationality" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.yearAttend",
                            groupOfNationality: { $push: "$$ROOT" },
                            sunOfYear: {$sum : "$count"}
                                
                        }
                    }

      ]
        ,function (err, Nationality ) {
          console.log("REFFFF---->>>", Nationality );
          User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program },
                                

                            ]

                        }
                    },
                    {
                        $group: {
                            _id: { yearAttend: "$local.yearAttend" },
                            groupOfNationality: { $push: "$$ROOT" },
                            count: { $sum: 1 }
                        }
                    }

                    

      ]
        ,function (err, student) {

      console.log("REFFFF---->>>", student );
            //referenceCurriculumSchema.find();

        User.aggregate(

                    [
                            {
                                $match: {
                                    $and: [
                                        { 'local.role': 'student' },
                                        { 'local.program': req.query.program },
                                        { 'detail.status': {$ne:"Drop Out"} }

                                    ]

                                }
                            },
                            {
                                $group: {
                                    _id: { yearAttend: "$detail.academicYear" },
                                    count: { $sum: 1 }
                                }
                            }

                            

              ]
                ,function (err, student_academicYear) {

                  console.log("REFFFF--student_academicYear-->>>", student_academicYear );
                    

                    res.render('qa/qa-aun8.3.ejs', {
                        //    user: req.user,      
                        layout: "qaPage",

                        docs: Nationality,
                        student:student,
                        student_academicYear:student_academicYear,
                        helpers: {
                            inc: function (value) { return parseInt(value) + 1; },
                            getyear: function (value) { return yearac[value]; },
                            getindex: function () { return ++index; }
                        }
                    });



        });

         });
        });

  });

  app.get('/aun6-9', isLoggedIn, function (req, res) {
      console.log("termination of lecturer");

      //referenceCurriculumSchema.find();

      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              Role.roleOfStaff.find({
                  $and: [
                        { "position": "Faculty Member" },
                        { "academicYear": req.query.year },
                                        { "program": req.query.program }
                  ]
              })
                .populate('user')
                .exec(function (err, lec) {

                  console.log("REFFFF---->>>", lec);

                    Role.roleOfStaff.find({
                        $and: [
                            { "position": "Visiting Member" },
                            { "academicYear": req.query.year },
                                        { "program": req.query.program }
                        ]
                    })
                .populate('user')
                .exec(function (err, visiting) {


                    console.log("REFFFF---->>>", visiting);
                    var index = 0;
                    res.render('qa/qa-aun6.9.hbs', {
                        //    user: req.user,      
                        layout: "qaPage",

                        docs: lec,
                        visiting:visiting,
                        helpers: {
                            getRetired: function (value) { return 60-parseInt(value); },
                            getAcYearOfRetired: function (value) { return parseInt(req.query.year) + (60 - parseInt(value)); },
                            getindex: function () { return ++index; },
                            getTerminate: function (value) { return parseInt(value) - parseInt(req.query.year); }
                        }

                    });
                });

                });
          } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }
      });

  });

  app.get('/aun13-2', isLoggedIn, function (req, res) {
      console.log("surveyAlumni");

      //referenceCurriculumSchema.find();

      User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program },
                                {'detail.status':'Graduate'}

                            ]

                        }
                    },

                    {
                        $group: {
                            _id: { graduatedIn: "$detail.academicYear", careerOrHigherStudying: "$detail.careerOrHigherStudying" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.graduatedIn",
                            groupOfCareerOrHigherStudying: { $push: "$$ROOT" },
                            sumOfYear: { $sum: "$count" }

                        }
                    }

            ]
        , function (err, programs) {


            //referenceCurriculumSchema.find();




            console.log("REFFFF---->>>", programs);
            var index = 0;
            res.render('qa/qa-aun13.2.hbs', {
               //    user: req.user,      
               layout: "qaPage",

               docs: programs,
               helpers: {
                   inc: function (value) { return parseInt(value) + 1; },
                   getyear: function (value) { return yearac[value]; },
                   getindex: function () { return ++index; }
               }
            });






        });

  });


  app.get('/aun14-1', isLoggedIn, function (req, res) {
      console.log("no of student status");

      //referenceCurriculumSchema.find();

      User.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'local.role': 'student' },
                                { 'local.program': req.query.program }

                            ]

                        }
                    },

                    {
                        $group: {
                            _id: { studentDetail: "$detail.status", academicYear: "$detail.academicYear" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.academicYear",
                            root: { $push: "$$ROOT" },
                            sumOfYear: { $sum: "$count" }

                        }
                    }

            ]
        , function (err, studentStatus) {


            //referenceCurriculumSchema.find();




            console.log("REFFFF---->>>", studentStatus);

            res.render('qa/qa-aun14.1.ejs', {
               //    user: req.user,      
               layout: "qaPage",

               docs: studentStatus,
               helpers: {
                   inc: function (value) { return parseInt(value) + 1; },
                   getyear: function (value) { return yearac[value]; },
                   getindex: function () { return ++index; }
               }
            });






        });

  });


  app.get('/aun14-4', isLoggedIn, function (req, res) {
      console.log("14-4");

      //referenceCurriculumSchema.find();

      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {

        console.log("programs.id: "+programs._id);

        Role.roleOfStaff.aggregate(

              [
                      {
                          $match: {
                              $and: [{
                                  
                                  $or: [
                                  {"type": "Academic Staff"},
                              {"position": "Graduate"}
                              ]},
                              

                              ]

                          }
                      },

                      {
                        $unwind:  "$user"    
                      },
                      { 
                        $group : { 
                           _id : {academicYear:"$academicYear",type:"$type", position:"$position"} ,

                          user: { $push: "$user" },
                          count:{$sum:1}
                        }

                    },
                      {
                          $group: {
                              _id: "$_id.academicYear",
                              root: { $push: "$$ROOT" },
                              // sumOfYear: { $sum: "$count" }

                          }
                      }

              ]
          , function (err, staffAndPublication) {


              //referenceCurriculumSchema.find();

              User.populate(staffAndPublication, {
                 path: 'root.user',    
             model: 'User'   
        },function(err, user) {


          User.populate(user, {
                 path: 'root.user.publicResearch',   
             model: 'Public'   
        },function(err, public) {

          User.populate(public, {
                 path: 'root.user.publicResearch.acyear',    
             model: 'Acyear'   
        },function(err, academicYear) {


              console.log("REFFFF--academic staff publication in 2014-->>>", academicYear);

              res.render('qa/qa-aun14.4.ejs', {
                 //    user: req.user,      
                 layout: "qaPage",

                 docs: staffAndPublication,
                 academicYear:req.query.year,

                 helpers: {
                     inc: function (value) { return parseInt(value) + 1; },
                     getyear: function (value) { return yearac[value]; },
                     getindex: function () { return ++index; }
                 }
              });

            });
            });

          });

          });
        });

  });
 //=====================================
  // Edit QA ==============================
  // =====================================

  

  //---------------------------edit aun 10.1 ----------------------------------------------------------------------
  app.get('/addaun10_1',isLoggedIn,function(req,res){
    console.log("[GET]Edit AUN 10.1");    
    console.log(req.query.acid);
   
    res.render('qa/editqa/aun10.1_add_facilities.hbs', {
            //    user: req.user,      
            layout: "qaPage",
            acid : req.query.acid
        }); 
    
  });
app.post('/addaun10_1',isLoggedIn,function(req,res){
    console.log("[POST]Edit AUN 10.1");    
    console.log(req.body.acid);
    console.log(req.body.roomno);
    console.log(req.body.floor);
    console.log(req.body.building);
    console.log(req.body.noofseat);
   
    FacilityAndInfrastruture.findOne({ 
      $and: [
                 { 'programAndAcYear' :  req.body.acid  },
                 { 'roomNo' : req.body.roomno }
               ]
      
    }, function (err, docs) {
          if(err) console.log("aun10_1 query err"+err);
          var facility = new FacilityAndInfrastruture();
            facility.programAndAcYear = req.body.acid;
            facility.roomNo = req.body.roomno;
            facility.floor = req.body.floor;
            facility.building = req.body.building;
            facility.numberOfSeat = req.body.noofseat;
           facility.save(function(err,manage) {
            if (err){console.log('cant make new facility'+err);}  
            else{
              console.log(manage);
              console.log("Insert new facility succesful");  
              res.redirect('/aun10-1?acid='+req.body.acid);                          
            }                         
         });  
         
    });    
    
  });

 app.get('/editaun10_1',isLoggedIn,function(req,res){
    var index =req.query.id;
    console.log("[Get]Edit AUN 10.1");
    return FacilityAndInfrastruture.findById(index, function( err, facility ) {
        if( !err ) {
        console.log(facility);
            res.render('qa/editqa/aun10_1edit.hbs', {
              layout: "adminPage",
              facility: facility ,                     
            });
        } else {
            return console.log( "query facility err"+err );
          }
      }); 
  });
  app.post('/editaun10_1',isLoggedIn,function(req,res){
    console.log("[Post] Edit AUN10.1");
    return FacilityAndInfrastruture.findById(req.body.facilityid, function( err, facility ) {
        if( err ) {console.log('Query facility err'+err);}
        console.log(facility);
        facility.editFacility(req,res);          
      }); 
  });

  app.get('/delaun10_1',isLoggedIn,function(req,res){
    console.log("Delete Aun10.1");
    console.log(req.query.id);
    //console.log(req.query.email);

    FacilityAndInfrastruture.remove(
          { '_id' : req.query.id },
          function(err, results) {
            if (err){console.log('Delete facility err'+err);}
          else console.log(results);
          }
       );
    res.redirect('/aun10-1?acid='+req.query.acid);

    
    
  });








//---------------------------------------------add aun 5.3--------------------------------------------------------------------
     

app.get('/add_aun5-3',isLoggedIn,function(req,res){
    console.log("[GET]add aun 5.3");

    console.log("program: "+req.query.program);
    
          
          Program.find( {'programname': { $exists: true }},function( err, program ) {

            console.log("program-------------------->:"+program);
          res.render('qa/editqa/aun5.3_add_assesment.hbs', {
            layout: "qaPage",
            program_fac:program,
            program : req.query.program,
            
            });

          });
    
  });




  app.post('/add_aun5-3',isLoggedIn,function(req,res){
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

          res.redirect('/aun5-3?program='+req.body.program);
          

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
                      res.redirect('/tqf25?acid='+req.body.acid+'&year='+req.body.year+'&program='+req.body.program);                          
                    }                         
                  });



                }


                  res.redirect('/aun5-3?program='+req.body.program);   
              });                         
            }                         
            });  
          }
          });
      }

        
    
    
     });

app.get('/del_aun5-3',isLoggedIn,function(req,res){
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
              res.redirect('/aun5-3?program='+program.programname);


            }

        });

       });
         


      }
    });
    
  });

app.get('/edit_aun5-3',isLoggedIn,function(req,res){
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
            program:results.programname
            
            });
        });

         

      }
    });
    
  });


app.post('/edit_aun5-3',isLoggedIn,function(req,res){
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

          res.redirect('/aun5-3?program='+req.body.program);

          

        } 
        else {
            console.log("ADD NEWWWW");
            
          }
          });
      }
    
  });






//----------------------------------------------------------------------------------------------------------------------------
  //=====================================
  // Get Work Info.(Student) ==============================
  // =====================================

  
  app.use('/thesisinf', thesisController );     //thesis 
  app.use('/publicationinf', publicController ); //publication  
  app.use('/traininf',trainController);  //Training Courses

    
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

