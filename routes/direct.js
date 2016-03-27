//var Handler		= require('./handler');
var path = require('path');
var fs = require('fs');
var exphbs = require('express3-handlebars');
var async = require('async');
var mongoose = require('mongoose');
//var busboy = require('connect-busboy');
var Handlebars = require('handlebars/runtime')['default'];
var isLoggedIn = require('middleware/loginChecker');

var formController = require('../lib/form');

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
var parseString 		= require('xml2js').parseString;
var WorkflowHandler		= require('./WorkflowHandler');
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
    // 	res.render('index.ejs', { message: req.flash('loginMessage') }); 
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
		}else{
			user = req.user;
		}
		console.log(user);
		return User.findOne({'local.username': user}, function( err, user ) {
	        if( !err ) {
	        	console.log(user);
	        	console.log(user.local.username);
	        	//console.log(Object.entries(user.local));
	        	console.log(user.local.role);
	        	res.render('profile/educationinfo.hbs', {
					layout: "profilePage",
		            user : user, // get the user out of session and pass to template
		            helpers: {
		            inc: function (value) { return parseInt(value) + 1; }
		        }			
		      });
	        } else {
	            return console.log( err+"mhaieiei" );
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
		console.log("Posttt Mhai eiei1234455678");
		var id = req.body.level+req.body.year;
		console.log(id);

		/*User.findOne({ 'local.email' : req.body.email }, function(err, user) {
				if (err){ 
					console.log("Upload Failed!");
					return done(err);}
				
				if (user!=null){
					console.log(user.education[0]);
					if(user.education[0] != null)
						console.log(req.body.level);
						console.log(req.body.degree);
						console.log(user);
						console.log("eiei");
						user.addEducation(req, res)
						
				}

		});*/

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
				if (err){console.log('mhaiiiiiii');}
			    else console.log(user);
		});
		res.redirect('/education_inf?name='+req.body.username);
		
		
	});
	//edit education information.
	app.get('/editeducation',isLoggedIn,function(req,res){
		var index =req.query.id;
		console.log("Get Edit education");
		console.log(req.query.id);
		res.render('profile/editedu.hbs', {
			layout: "profileMain",
            user : req.user, // get the user out of session and pass to template
			index : req.query.id,
			education : req.user.education[index]
        });
	});
	app.post('/editedu',isLoggedIn,function(req,res){
		console.log("Edit education");
		console.log(req.query.id);
		user : req.user		
		User.findOne({'local.email' : req.body.email },{ education: 1}, function(err, user) {
					if (err){ 
						console.log("Upload Failed!");
						return done(err);}
					
					if (user){
							console.log(user);
							console.log("eiei");
							user.editEducation(req, res)
							
					}

			});
	});
	//delete education information.
	app.get('/deledu',isLoggedIn,function(req,res){
		console.log("Delete Education");
		console.log(req.query.username);
		User.update({ 'local.username' : 'admin' },
		{
		 "$pull" : {
			"education" :  {

					 "id": req.query.id,
					} //inserted data is the object to be inserted 
			  }
			},{safe:true},
			  function (err, user) {
				if (err){console.log('mhaiiiiiii');}
			    else console.log(user);
		});
		res.redirect('/education_inf?');
		
		
	});
	 // =====================================
    // Admin SECTION =====================
    // =====================================


    app.get('/admin',isLoggedIn,function(req,res){
		console.log("Get Admin");
		console.log(current_year);
		res.render('admin/home.hbs', {
			layout: "adminMain",
            user : req.user // get the user out of session and pass to template			
        });
	});


    //user section================================================================================== 
	app.get('/user',isLoggedIn,function(req,res){
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
            return console.log( err+"mhaieiei" );
	        }
	    });

	})

	app.post('/user',isLoggedIn,function(req,res){
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

 	app.get('/showuser',isLoggedIn,function(req,res){
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
    

     app.get('/adduser',isLoggedIn,function(req,res){
		console.log("Admin Get add user setting");
		console.log(req.query.program);
		res.render('admin/faculty/user/adduser.hbs', {
			layout: "adminPage",
            user : req.user, // get the user out of session and pass to template
            program: req.query.program			
        });
	});

    app.post('/adduser',isLoggedIn,function(req,res){
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
	    var usertest = {
            'email': "aaa",
            'name': "bbb",
            'password': "ccc",
            'Role': 'lecterer'};
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
	  
	   
 		res.redirect('/showuser?program='+req.body.program);    
	});
 	app.get('/deluser',isLoggedIn,function(req,res){
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
		res.redirect('/showuser?program='+req.query.program);

		// Subject.update({ 'sub_code' : req.query.id },
		// {
		//  "$unset" : {"sub_code": req.query.id},				  
		// 	},{safe:true},
		// 	  function (err, user) {
		// 		if (err){console.log('mhaiiiiiii');}
		// 	    else console.log(user);
		// });
		// res.redirect('/subjects');
		
		
	});
 		//program section======================================================================================================================
	app.get('/programs',isLoggedIn,function(req,res){
		console.log('Admin Get Program');
		console.log(years);
		console.log(years[0]);
		return Fac.find( function( err, faculty ) {
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
	app.post('/programs',isLoggedIn,function(req,res){
		console.log("Admin Post Program");
		console.log(req.body.sub_programs);
		console.log(req.body.years);
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
			res.redirect('/showprogram?id='+ac.id);
			// res.render('admin/faculty/searchprogram.hbs',{
			// 	layout: "adminMain",
			// 	user: req.user,
			// 	program : req.body.sub_programs,
			// 	acid : ac.id,
			// 	year : req.body.years
				
			// 	});
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
                 res.redirect('/showprogram?id='+acc.id);               	
                }
            });
       	  
       	 }
       	});
	
  });

 	app.get('/editprogram',isLoggedIn,function(req,res){
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


    
    app.get('/showprogram',isLoggedIn,function(req,res){
    	console.log("Admin get showprogram");
    	console.log(req.query.id);

    	Teach
		.find({'ac_id': req.query.id})
		.populate('subject.subcode')
		.exec(function(err, docs) {
		  if(err) console.log(err);
		  Teach.populate(docs, {
		    path: 'subject.subcode.sub_lecter',
		    model: 'User'
		  },
		  function(err, subs) {
		    if(err) console.log(err);
		   	  // This object should now be populated accordingly.
		    console.log(subs);

    			res.render("admin/faculty/program/showprogram.hbs", {
            	layout: "adminPage",
            	user : req.user,
            	teachsemes: subs,
            	year : years,
            	acid : req.query.id,
           
             });
		  });
		});

    });

	app.post('/showprogram',isLoggedIn,function(req,res){
	console.log("Post show program");
	console.log(req.body.sub_programs);
	console.log(req.body.years);
	console.log(req.query.acid);	

		
 	});
	

	app.get('/addprogram',isLoggedIn,function(req,res){
		console.log("Admin Add Head program");
		res.render('admin/faculty/program/addprogram.hbs',{
			layout: "adminPage",
			user: req.user
		});
	});

	app.post('/addprogram',function(req,res){
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
                res.redirect('/programs');
            }

        });  
		

	});
	app.get('/delprogram',isLoggedIn,function(req,res){
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
		res.redirect('/programs');

		
		
	});

	app.get('/editsubprogram',isLoggedIn,function(req,res){
 		console.log('Admin edit program');
 		console.log(req.query.id);
 		console.log(req.query.year);
 		console.log(req.query.semes)
 		
 		Teach
		.findOne({ $and: [
	     		 { 'ac_id' : req.query.id },
	             { 'Year' : req.query.year },
	             { 'semester' : req.query.semes }
	           ]
	    }).populate('subject.subcode')
		.exec(function(err, docs) {
		  if(err) return callback(err);
		  Teach.populate(docs, {
		    path: 'subcode.sub_lecter',
		    model: 'User'
		  },function(err, subs) {
		    if(err) return callback(err);
		   	  // This object should now be populated accordingly.
		    console.log(subs);
		    console.log(subs.subject.length);
    			res.render("admin/faculty/program/editsubprogram.hbs", {
            	layout: "adminPage",
            	user : req.user,
            	subprogram: subs,
            	len : subs.subject.length,
            	acid : req.query.id,
            	year : years,
            	helpers: {
            	inc: function (value) { return parseInt(value) + 1; } } 
           
             });
		  });
		});
		
 	   

 	});

	app.get('/addsubprogram',isLoggedIn,function(req,res){
		console.log('Admin add Program');
		console.log(req.query.acid);
		console.log(yearlevel);
		res.render("admin/faculty/program/addprogramtrack.hbs",{
			layout : "adminPage",
			user : req.user,
			acid : req.query.acid,
			yearlevel : yearlevel
		});
	});	
		


	app.post('/addsubprogram',isLoggedIn,function(req,res){
		console.log("Posttt Add Program");
		console.log(req.body.acid);
		//console.log(req.body.subject_lec);
		//subject objects
		var lenn = req.body.arrlen;	    
	    var array = [];	   
	    var arrsub = [];
	    var year_1,year_2,year_3= "";
		// var str = req.body.subject_lec;
		// var arr = str.split(",");

		//FIND YEAR
		//
  //        Acyear.findById(req.body.acid , function(err, ac) {        
  //       if (err){
		// 	console.log("Error ...1");
		// }
  //       else {
  //          console.log("Find year from this");
	 //       var acyear_1 = ac.academic_year;
	 //       var acyear_2 = acyear_1-1;
	 //        year_1 = acyear_1.toString();
	 //        year_2 = acyear_2.toString();
	 //        year_3 = "<"+year_2;
	 //       console.log("year1"+year_1+"year2"+year_2+"year3"+year_3);
	   	  
  //      	 }
  //      	});
  
       
       

		
		console.log(lenn);


	    for(var i=0;i<lenn;i++){	    	
	    	if(lenn==1){
	    		var str = req.body.subject_lec;
				var arr_lec = str.split(",");
		
	    		var obj = { 
	    		'sub_code':req.body.subject_code,
	    		'sub_name': req.body.subject_name,
	    		'sub_lecter': arr_lec,
	    		'sub_credit': req.body.subject_credit
	    		}
	    		
	    	}
	    	else{
	    		var str = req.body.subject_lec[i];
				var arr_lec = str.split(",");		
	    		var obj = {
	    			'sub_code':req.body.subject_code[i],
	    			'sub_name': req.body.subject_name[i],
	    			'sub_lecter': arr_lec,
	    			'sub_credit': req.body.subject_credit[i]	    			  		
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
				             { 'semester' : req.body.semes }
				           ]
				    }, function(err, sub) {
		            console.log(nametemp);
		            if (err){
						console.log("Error ...1");
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
						// save the user
			            newTeach.save(function(err,teach) {
			                if (err){console.log('sub2'+err);}
			                else console.log("Insert already"+ teach);
			            });
		                
		            }
		            
		        });  
	        	




	        res.redirect('/showprogram?id='+req.body.acid);
	        console.log("done");
	    });			
 	});
	app.get('/delsubprogram',isLoggedIn,function(req,res){
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
		res.redirect('/showprogram?id='+req.query.acid);

		
		
	});
	//subject section======================================================================================================================
	app.get('/subjects',isLoggedIn,function(req,res){
		console.log('Admin Get Subject select');
		return Fac.find( function( err, faculty ) {
        if( !err ) {
			console.log(faculty);
            res.render("admin/faculty/subject/subjectselect.hbs", {
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

	app.post('/subjects',isLoggedIn,function(req,res){
		console.log("Admin Post Subject");
		console.log(req.body.sub_programs);
		console.log(req.body.years);
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
			res.redirect('/showsubject?acid='+ac.id+'&program='+ac.program_name+'&acyear='+ac.academic_year);
			// res.render('admin/faculty/searchprogram.hbs',{
			// 	layout: "adminMain",
			// 	user: req.user,
			// 	program : req.body.sub_programs,
			// 	acid : ac.id,
			// 	year : req.body.years
				
			// 	});
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
                 res.redirect('/showsubject?acid='+acc.id+'&program='+acc.program_name+'&acyear='+acc.academic_year);               	
                }
            });
       	  
       	 }
       	});
	
  });

	 app.get('/showsubject',isLoggedIn,function(req,res){
    	console.log("Admin get showsubjects");
    	console.log(req.query.acid);
    	console.log(req.query.program);
    	console.log(req.query.acyear);
    	var acyear,semester,yearlevel;

    	Teach
		.find({'ac_id': req.query.acid})
		.populate('subject.subcode')
		.exec(function(err, docs) {
		  if(err) console.log(err);
		  Teach.populate(docs, {
		    path: 'subject.subcode.sub_lecter',
		    model: 'User'
		  },
		  function(err, subs) {
		    if(err) console.log(err);
		   	  // This object should now be populated accordingly.
		    console.log(subs);
    			res.render("admin/faculty/subject/subjecthome.hbs", {
            	layout: "adminPage",
            	user : req.user,
            	teachsemes: subs,
            	year : years,
            	acid : req.query.id,
            	helpers: {  
            	setac: function(ac){acyear = ac;},
            	setsemes: function (semes) {semester = semes; },
            	setyear: function(year){yearlevel = year;},
            	getac: function () {return acyear; },          	
            	getsemes: function () {return semester; },
            	getyear: function(){return yearlevel;},
            
            }
           
             });
		  });
		});

    });
	
	/*app.get('/subjects',isLoggedIn,function(req,res){
		console.log('Admin Get Subject Home');
		//console.log(years);
		Subject.find().populate('sub_lecter').exec(function( err, subject ) {
        if( !err ) {
			console.log(subject);
            res.render("admin/faculty/subject/subjecthome.hbs", {
            	layout: "adminPage",
            	user : req.user,
            	subjects: subject,
            	
            });
        } else {
            return console.log( err+"mhaieiei" );
	        }
	    });		
	});*/

	app.get('/addsubjects',isLoggedIn,function(req,res){
		console.log('Admin Get Add Subject');
		console.log(years);
		return Fac.find( function( err, faculty ) {
        if( !err ) {
			console.log(faculty);
            res.render("admin/faculty/subject/subject.hbs", {
            	layout: "adminPage",
            	user : req.user,
            	faculty: faculty,
            	year : years
            });
        } else {
            return console.log( err+"mhaieiei" );
	        }
	    });		
	});

	app.post('/addsubjects',isLoggedIn,function(req,res){
		console.log("Posttt Add Subject");
		console.log(req.body.sub_code);
		console.log(req.body.lec_name);
		//lec objects
		var lenn = req.body.arrlen;	    
	    var array = [];	   
	    var arrsub = []; 
	    console.log(lenn);
	    for(var i=0;i<lenn;i++){
	    	if(lenn==1){
	    		var obj = {
	    			'_id' : req.body.sub_code,
	    			'sub_lecter': req.body.lec_name}
	    	}
	    	else{
	    		var obj = {
	    			'_id' : req.body.sub_code,
	    			'sub_lecter': req.body.lec_name[i]}	    		
	    	}
	    	array.push(obj);
	    }
	    console.log(array);	
		Subject.findOne({ 'sub_code' :  req.body.sub_code }, function(err, sub) {
            
            if (err){
				console.log("Error ...1");
			}
            // check to see if theres already a user with that email
            if (sub!=null) {
				console.log("That code is already have");
            } else {
                var newSub        = new Subject();

                // set the user's local credentials
				newSub.sub_code = req.body.sub_code;
				newSub.sub_name = req.body.sub_name;
				newSub.sub_credit = req.body.sub_credit;
      async.eachSeries(array,function(item,callback) {        	
			     User.findOne( { 'local.name' :  item.sub_lecter }, function (err, rows) {
			        	if(err){
			        		console.log("mhai_0err"+err);
			        	}
			        	if(rows != null){
			        		console.log("This user have already");
			        		console.log(rows);
			        		console.log(item);

			        		//if user have already, set ref of id user to subject
			        		
			        		newSub.sub_lecter.push(rows._id);
			        		newSub.save(function(err,sub) {
			                    if (err){console.log('mhaiiiiiii_1'+err);}  
			                    else{
			                    	console.log("Insert subject already"+sub)		                    	
			                    }			                    
			                });

			                //if user have already, push subject to user
			                rows.subjects.push(item._id);
			                rows.save(function(err,sub){
			                	if(err)console.log(err);
			                	else console.log('Update User already');
			                });

			                callback(err);
			        	}
			        	else{
		        		//if there is no user 
		           	    // create the user
		           	   var userobj = { 
		           	    	'_id' : index,
		           	    	'local': {
		           	    	'username': index,
				    		'name': index,
				    		'program' : "",
				    		'role': "staff"},
				    		'subjects' : [sub._id] 
				    		}
				    	//also add subject code to user
		                var newUser        = new User(userobj);		                
		                // save the user
		                newUser.save(function(err,user) {
		                    if (err){console.log('mhaiiiiiii_2'+err);}
		                    else {
		                    	console.log("Insert new User already"+user);
		                    	//set id of user to this subject
		                    	
		                    	newSub.sub_lecter.push(user._id);
		                    	// save the subject
				                newSub.save(function(err,sub) {
				                    if (err){console.log('mhaiiiiiii_3'+err);}  
				                    else{
				                    	console.log("Insert subject already"+sub)
				                    	callback(err);
				                    }
				                    
				                });
		                    }
		                });
			        		
			        	}
			        	
			        });         	
			    },function(err) {
			        if (err) console.log('mhai_4');
			        res.redirect('/subjects');
			        console.log("done");
			    });
               	
               
            }

        });  
 		
 	});

 		//delete subject information.
	app.get('/delsub',isLoggedIn,function(req,res){
		console.log("Delete Subject");
		console.log(req.query.id);
		//console.log(req.query.email);

		Subject.remove(
		      { '_id' : req.query.id },
		      function(err, results) {
		        if (err){console.log('mhaiiiiiii');}
		 	    else console.log(results);
		      }
		   );
		res.redirect('/subjects');

		// Subject.update({ 'sub_code' : req.query.id },
		// {
		//  "$unset" : {"sub_code": req.query.id},				  
		// 	},{safe:true},
		// 	  function (err, user) {
		// 		if (err){console.log('mhaiiiiiii');}
		// 	    else console.log(user);
		// });
		// res.redirect('/subjects');
		
		
	});
		//edit education information.
	app.get('/editsubject',isLoggedIn,function(req,res){
		var index =req.query.id;
		console.log("Admin Edit subject");
		console.log(req.query.id);

		return Subject.findOne({'sub_code' : req.query.id }, function( err, subject ) {
        if( !err ) {
			console.log(subject);
            res.render('admin/faculty/subject/editsubject.hbs', {
              layout: "adminPage",
			  user : req.user,
              subject: subject,
              helpers: {
            	inc: function (value) { return parseInt(value) + 1; }
            }
            });
        } else {
            return console.log( err+"mhaieiei" );
	        }
	    });	
	});
	
	app.post('/editsubjects',isLoggedIn,function(req,res){
		console.log("Admin Edit subject");
		//console.log(req.query.id);
		//user : req.user		
		Subject.findOne({'sub_code' :  req.body.sub_code },
			function(err, sub) {
				if (err){ 
					console.log("Upload Failed!");
					return done(err);}				
				if (sub){
					console.log(sub);
					sub.editSubject(req, res)						
				}

			});
	});
	//enroll section=======================================================================================================

	app.get('/enroll',function(req,res){
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

	app.get('/addenrollstd',function(req,res){
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

	app.post('/addenrollstd',function(req,res){
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
			        res.redirect('/enroll?sub_id='+req.body.subid+'&acid='+req.body.acid+'&year='+req.body.year+'&semes='+req.body.semes);
			        console.log("done");
			    });

			}
			else {
				console.log("Sub enroll find err"+err);
			}


        });  


	});

	//=====================================
    // Get QA Info. ==============================
    // =====================================
    app.get('/qapage',function(req,res){
		console.log('Get QA Info(select program)');
		console.log(years);
		console.log(years[0]);
		return Fac.find( function( err, faculty ) {
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
			acid : programs._id
		 	});
		}	
	});
});
    app.get('/tqf21',function(req,res){
		console.log('Get TQF21');
		console.log(req.query.program);
		console.log(req.query.year);
		var a=1;
		var b=0;
		var fact=true;
		return User.find({ $and: [
	            { 'local.program' : req.query.program },
	            { 'local.role' : 'staff' }
	          ]}, function( err, clients ){
        if( !err ) {
			console.log(clients);
            res.render("qa/tqf21.ejs", {
            	user : req.user,
            	clients: clients,
            	fact : fact,
            	helpers: {
	            inc: function (value) { return parseInt(value) + 1; },
	            set: function (value) { a = value; },
            	get: function(){return a;},
            	setindex: function(value){
            		b = value;
            		if(value==0) fact=true;
            		else fact = "";
            		
            	},
            	getindex: function(){return b; } ,
            	isfirst: function(){            		
            		if(b == 0) return 'true';
            		else return 'false';
            	},
            	notfirst: function(){            		
            		if(b != 0) return true;
            		else return false;
            	}
	        }
	        });
        } else {
            return console.log( err+"mhaieiei" );
	        }
	    });
		
		
	});
		
	
	app.get( '/tqf22',isLoggedIn, function( req, res ) {
		console.log( "Get TQF22");
		console.log(req.query.acid);
		console.log(req.query.year);
		
		
		var index = 1;
		var acyear_1 = req.query.year;
	    var acyear_2 = acyear_1-1;
	    var yearac = [];
	     yearac[0] = acyear_1.toString();
	     yearac[1] = acyear_2.toString();
	     yearac[2] = "<"+acyear_2.toString();
	     yearac[3] = ">"+acyear_1.toString();
	       
	       
		
        	Teach
			.find({'ac_id': req.query.acid})
			.populate('subject.subcode')
			.exec(function(err, docs) {
			  if(err) return callback(err);
			  Teach.populate(docs, {
			    path: 'subject.subcode.sub_lecter',
			    model: 'User'
			  },
			  function(err, subs) {
			    if(err) console.log("find teach err"+err);
			   	  // This object should now be populated accordingly.
			    	console.log(subs);
	    			res.render('qa/tqf22.hbs', {
	    			  layout: "qaPage",
					  user : req.user,
		              program: subs,		             
		              year: req.query.year,
		              helpers: {
	            		inc: function (value) { return parseInt(value) + 1; },
	            		getyear:function(value) {return yearac[value];},
	            		getindex:function() {return index++;}}

		            });
			  });	
			});           
      
      
	 
	});
	// app.get( '/tqf23',isLoggedIn, function( req, res ) {
	// 	console.log( "Get TQF23");
	// 	console.log(req.query.acid);
	// 	console.log(req.query.program);
		
	// 	var index = 1, idof = 0;
	// 	// User.find({''})//find user that advising project != null
	// 	Work.Project
	// 	.find({'acyear': req.query.acid})
	// 	.populate({
	// 		path:'advisee advisor coadvisor examiner',
	// 		model : 'User'
	// 	}).exec(function(err, works) {
	// 	    if(err) console.log("find teach err"+err);
	// 	   	  // This object should now be populated accordingly.
	// 	    	console.log(works);
	// 	    	console.log(works[0].nametitle);
 //    			res.render('qa/tqf23.hbs', {
 //    			  layout: "qaPage",
	// 			  user : req.user,
	//               Thesis: works,		             
	//               year: req.query.year,
	//               helpers: {
 //            		inc: function (value) { return parseInt(value) + 1; },
 //            		getindex:function() {return index++;},
 //            		setid:function(value) {idof =  parseInt(value) + 1;},
 //            		getid:function() {return idof;}

 //            		}

	//             });	
	// 	});   
	// });

	app.get('/tqf23',isLoggedIn,function(req,res){
		console.log("tqf23");
		console.log("change state");
		console.log(req.query.acid);
		//console.log(req.query.program);
		//var id = mongoose.Types.ObjectId('56d14d1c8393baa816709274');
		Work.Project.aggregate([
        {
            $match: { 'acyear' : req.query.acid }           
        },
       { 
       		$unwind: "$user"
       },
       {
       		 $group: {
   				 _id: "$user.iduser",
   				 works: { $addToSet: { workid: '$_id',roleuser:"$user.typeuser"} }
 		 }

	   }], function( e, result ) {
	  		console.log(result);
	  		console.log(result[0].works);
	  		console.log(result[1].works);
	  		Work.Project.populate(result,{path:'_id',model:'User'},function(err,userwork){
	  			if(err){console.log("first populate is err"+err);}
	  			console.log(userwork);
	  			console.log(userwork[0].works[0].roleuser);
	  			Work.Project
				.find({'acyear': req.query.acid})
				.populate({
					path:'user.iduser',
					model : 'User'
				}).exec(function(err, works) {
				    if(err) console.log("find teach err"+err);
				   	  // This object should now be populated accordingly.
				    	console.log(works);
				    	console.log(works[0].nametitle);
				    	console.log(works[0].user[0].iduser.local.username);
		    			res.render('qa/tqf23_test.ejs', {
		    			  //layout: "qaPage",
						  user : req.user,
						  examiner : userwork,
			              Thesis: works,		             
			             //  helpers: {
		            		// inc: function (value) { return parseInt(value) + 1; },
		            		// getindex:function() {return index++;},
		            		// setid:function(value) {idof =  parseInt(value) + 1;},
		            		// getid:function() {return idof;}

		            		// }

			            });	
				});   

	  		});
	  		
		  	   
			});

	});

	app.get('/tqf24',isLoggedIn,function(req,res){
		console.log("tqf24 publications of advisors");
		console.log(req.query.acid);
		//console.log(req.query.program);
		//var id = mongoose.Types.ObjectId('56d14d1c8393baa816709274');
		Work.Project.aggregate([
        {
            $match: { $and: [
	            { 'acyear' : req.query.acid },
	            { '_type' : 'publicResearch' }
	         ]}            
        },
       { 
       		$unwind: "$user"
       },
       {
       		 $group: {
   				 _id: "$user.iduser",
   				 works: { $addToSet: { workid: '$_id',roleuser:"$user.typeuser"} }
 		 }

	   }], function( e, result ) {
	  		console.log(result);
	  		console.log(result[0].works);
	  		console.log(result[1].works);
	  		Work.Project.populate(result,[{path:'_id',model:'User'},{path:'works.workid',model:'Work'}],function(err,userwork){
	  			if(err){console.log("first populate is err"+err);}
	  			console.log(userwork);
	  			console.log(userwork[0].works[0].roleuser);
	  			Work.Project
				.find({'acyear': req.query.acid})
				.populate({
					path:'user.iduser',
					model : 'User'
				}).exec(function(err, works) {
				    if(err) console.log("find teach err"+err);
				   	  // This object should now be populated accordingly.
				    	console.log(works);
				    	console.log(works[0].nametitle);
				    	console.log(works[0].user[0].iduser.local.username);
		    			res.render('qa/tqf24', {
		    			  layout: "qaPage",
						  user : req.user,
						  examiner : userwork,
			              Thesis: works,		             
			             //  helpers: {
		            		// inc: function (value) { return parseInt(value) + 1; },
		            		// getindex:function() {return index++;},
		            		// setid:function(value) {idof =  parseInt(value) + 1;},
		            		// getid:function() {return idof;}

		            		// }

			            });	
				});   

	  		});
	  		
		  	   
			});

	});

	app.get('/aun10-1', isLoggedIn, function (req, res) {
	    console.log("FacilityAndInfrastrutureSchema");
	    console.log("program :"+req.query.program);
	    Acyear.findOne({
	        $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
	        ]
	    }, function (err, programs) {
	        if (!err) {
	            console.log(programs._id);
	            //referenceCurriculumSchema.find();
	            FacilityAndInfrastruture.find({ 'programAndAcYear': programs._id }, function (err, docs) {

	                console.log("REFFFF---->>>", docs);

	                res.render('qa/qa-aun10.1.hbs', {
	                    //    user: req.user,      
	                    layout: "qaPage",

	                    docs: docs
	                });




	            });

	        } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
	        }
	    });

	});

	app.get('/aun3-3', isLoggedIn, function (req, res) {
	    console.log("knowledgeAndSkill");

	    //referenceCurriculumSchema.find();

	    Acyear.findOne({
	        $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
	        ]
	    }, function (err, programs) {
	        if (!err) {
	            console.log(programs._id);
	            //referenceCurriculumSchema.find();
	            Teach.find({
	                $and: [
                    { 'ac_id': programs._id },
	                { 'plan': { $exists: true } }
	                ]
	            })
                .populate('plan')
                .populate('subject.subcode')
                .exec(function (err, docs) {
                    Teach.populate(docs, {
                        path: 'subject.subcode.ELO.ELO',
                        model: 'Subject'
                    },
                    function (err, subs) {


                        console.log("REFFFF---->>>", subs);

                        res.render('qa/qa-aun3.3.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",

                            docs: subs

                        });

                        //, function (err, docs) {


                    });
                });
	        } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
	        }
	    });






	});

	app.get('/aun5-3', isLoggedIn, function (req, res) {
	    console.log("assesmentTool");

	    //referenceCurriculumSchema.find();


	    Fac.findOne({ 'programname': req.query.program }, function (err, docs) {
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

                     docs: result,
                     helpers: {
                         inc: function (value) { return parseInt(value) + 1; },
                         getyear:function(value) {return yearac[value];},
                         getindex:function() {return ++index;}}

                 });

                 });
	    });
                 //, function (err, docs) {



            


	});

	

	app.get('/aun2-1', isLoggedIn, function (req, res) {
	    console.log("aun21-refCurriculum");

	    

	    Fac.find({ 'programname': req.query.program })
             .populate('referenceCurriculum')
            .populate('structureOfCurriculum')
             .exec(function (err, docs) {
                 Fac.populate(docs, [{
                     path: 'referenceCurriculum.detail',
                     model: 'detail'
                 },
                 {
                     path: 'structureOfCurriculum.knowledgeBlock',
                     model: 'KnowledgeBlock'
                 }
                 ],
                    function (err, subs) {


                        console.log("REFFFF---->>>", subs);


                        Acyear.findOne({
                            $and: [
                                   { 'program_name': req.query.program },
                                   { 'academic_year': req.query.year }
                            ]
                        }, function (err, programs) {
                            if (!err) {
                                console.log(programs._id);
                                //referenceCurriculumSchema.find();
                                Teach.find({ 'ac_id': programs._id }).sort({ "Year": 1 })
                                .populate('plan')
                                .populate('subject.subcode')
                                .exec(function (err, docs) {
                                    Teach.populate(docs, {
                                        path: 'subject.subcode',
                                        model: 'Subject'
                                    },
                                    function (err, subs2) {


                                        console.log("REFFFF--2-->>>", subs2);

                                        var index = 0;
                                        res.render('qa/qa-aun2.1.hbs', {
                                            //    user: req.user,      
                                            layout: "qaPage",

                                            docs: subs,
                                            subs:subs2,
                                            helpers: {
                                                inc: function (value) { return parseInt(value) + 1; },
                                                getyear: function (value) { return yearac[value]; },
                                                getindex: function () { return ++index; }
                                            }
                                        });


                                        //, function (err, docs) {


                                    });
                                });
                            } else {
                                //res.redirect('/fachome');
                                return console.log(err + "mhaieiei");
                            }
                        });

                        

                    });


             });

	});

	app.get('/aun11-4', isLoggedIn, function (req, res) {
	    console.log("evaluationMethod");

	    //referenceCurriculumSchema.find();


	    Fac.find({ 'programname': req.query.program })
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

	app.get('/aun11-1', isLoggedIn, function (req, res) {
	    console.log("developmentCommittee");

	    //referenceCurriculumSchema.find();
	    Acyear.findOne({
	        $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
	        ]
	    }, function (err, programs) {
	        if (!err) {
	    Role.roleOfProgram.find({
	        $and:[{

	            "type": "Development Committee"},
                { "academicYear": programs._id}
	        ]
	    })
        .populate('user')
        .exec(function (err, docs) {

            console.log("REFFFF---->>>", docs);
            var index = 0;
            res.render('qa/qa-aun11.1.hbs', {
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
	        } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
	        }
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
                        { "academicYear": programs._id}
	                ]
	            })
                .populate('user')
                .exec(function (err, docs) {


                    console.log("REFFFF---->>>", docs);

	        var index = 0;
	        res.render('qa/qa-aun7.hbs', {
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
	        } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
	        }
	    });

	});

	app.get('/aun12-1', isLoggedIn, function (req, res) {
	    console.log("careerDevelopment");

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
	                console.log("REFFFF--activity-->>>", result);

	                User.populate(result, {
	                    path: '_id',
	                    model: 'User'
	                },
                         function (err, subs) {



                             console.log("REFFFF--USERR----activity-->>>", subs);





                             //res.render('C:/Monkey-Office-master/webproject/views/qa/test_careerDevelopment.hbs', {
                             //    //    user: req.user,      
                             //    layout: "workflowMain",

                             //    docs: subs

                             //});


                             });
	           

	            });
	        } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
	        }
	    });



	});

	app.get('/aun1-3', isLoggedIn, function (req, res) {
	    console.log("mapELOAndKnowledge");

	    Fac.find({ 'programname': req.query.program })
             .populate('Responsibility')

             .exec(function (err, docs) {
                 Fac.populate(docs, {
                     path: 'Responsibility.ELO',
                     model: 'ELO'
                 },
                    function (err, subs) {


                        console.log("REFFFF---->>>", subs);

                        res.render('qa/qa-aun1.3.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",

                            docs: subs,
                            helpers: {
                                inc: function (value) { return parseInt(value) + 1; },
                                getyear: function (value) { return yearac[value]; },
                                getindex: function () { return ++index; }
                            }
                        });


                    });


             });

	});

	app.get('/aun1-4', isLoggedIn, function (req, res) {
	    console.log("stakeholderReq");

	    //referenceCurriculumSchema.find();


	    Fac.find({ 'programname': req.query.program })
             .populate('stakeholder')

             .exec(function (err, docs) {
                 Fac.populate(docs, {
                     path: 'stakeholder.ELO',
                     model: 'ELO'
                 },
                    function (err, subs) {


                        console.log("REFFFF---->>>", subs);

                        res.render('qa/qa-aun1.4.hbs', {
                            //    user: req.user,      
                            layout: "qaPage",

                            docs: subs,
                            helpers: {
                                inc: function (value) { return parseInt(value) + 1; },
                                getyear: function (value) { return yearac[value]; },
                                getindex: function () { return ++index; }
                            }
                        });


                    });


             });

	});

	app.get('/aun6-1', isLoggedIn, function (req, res) {
	    console.log("listOfLecturer");

	    //referenceCurriculumSchema.find();
	    Acyear.findOne({
	        $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
	        ]
	    }, function (err, programs) {
	        if (!err) {
	            console.log("REFFFF--programs._id-->>>", programs._id);
	            Role.roleOfStaff.findOne({
	                $and:[{

	                    "type": "Academic Staff"},
                        { "academicYear": programs.id}
	                ]
	            },function (err, docs) {
	                console.log("REFFFF--docs._id-->>>", docs._id);
	                //User.aggregate([
                    //    // Get just the docs that contain a shapes element where color is 'red'
                    //    { $match: { 'roleOfStaff': docs.id } },
                    //    {
                    //        $project: {
                    //            'education': {
                    //                $filter: {
                    //                    //input: '$education',
                    //                    //as: 'edu',
                    //                    //cond: { $eq: ['$$edu.level','Doctoral'] }
                    //                }
                    //            }
                                
                                    
                                
                    //        }
                    //    }
	                //]
	                User.find(
                              { 'roleOfStaff': docs.id }
                              

	                    
	                )
                    .populate('publicResearch')
                    .exec(function (err, programs) {

                    //,function (err, programs) {
                        //referenceCurriculumSchema.find();




                        console.log("REFFFF---->>>", programs);

                        //res.render('qa/qa-aun6.1.hbs', {
                        //    //    user: req.user,      
                        //    layout: "qaPage",

                        //    docs: programs,
                        //    helpers: {
                        //        inc: function (value) { return parseInt(value) + 1; },
                        //        getyear: function (value) { return yearac[value]; },
                        //        getindex: function () { return ++index; }
                        //    }
                        //});






                    });
                });
                } else {
	            //res.redirect('/fachome');
	            return console.log(err + "mhaieiei");
            }
	    });

	});

	//app.get('/aun6-2', isLoggedIn, function (req, res) {
	//    console.log("tab 3.11 rankingOfstaff");

	//    //referenceCurriculumSchema.find();


	//    User.find({
	//        $and: [
    //            { 'local.programName': req.query.program },
    //            { 'local.role': "Lecturer" },
    //            { 'education': { $elemMatch: { 'level': 'Doctoral' } } }
	//        ]
	//    })
    //    .populate('publicResearch')
    //    .exec(function (err, programs) {


    //        //referenceCurriculumSchema.find();




    //        console.log("REFFFF---->>>", programs);

    //        //res.render('qa/qa-aun6.1.hbs', {
    //        //    //    user: req.user,      
    //        //    layout: "qaPage",

    //        //    docs: programs,
    //        //    helpers: {
    //        //        inc: function (value) { return parseInt(value) + 1; },
    //        //        getyear: function (value) { return yearac[value]; },
    //        //        getindex: function () { return ++index; }
    //        //    }
    //        //});






    //    });

    //});

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
        ,function (err, programs) {


            //referenceCurriculumSchema.find();




            console.log("REFFFF---->>>", programs);

            res.render('C:/Monkey-Office-master/webproject/views/qa/test_FacilityAndInfrastruture.hbs', {
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
	
	//=====================================
    // Get Work Info.(Student) ==============================
    // =====================================

  //-------------------thesis---------------------------------------------------------------------------

	app.get('/thesisinf',isLoggedIn,function(req,res){
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

    			res.render("profile/works/thesisinfo_test.ejs", {
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
	app.get('/addthesis',isLoggedIn,function(req,res){
		console.log("Add Thesis");
		console.log(req.query.user);
		res.render('profile/works/addthesis_test.hbs', {
			layout: "profilestudent",
            username : req.query.user // get the user out of session and pass to template			
        });
	});

	app.post('/addthesis',isLoggedIn,function(req,res){
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
		
	
	//-----------------publication------------------------------------------------------------------

	app.get('/publicationinf',isLoggedIn,function(req,res){
		console.log("Get Publication Information");
		console.log(req.query.name);
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
            	user : req.query.name,
            	Userinfo: works,
            	year : years,
            	acid : req.query.id,
           
             });
		  });
		});		
	});
	//add publication
	app.get('/addpublication',isLoggedIn,function(req,res){
		console.log("Add Publication");
		console.log(req.query.user);
		res.render('profile/works/addpublic.hbs', {
			layout: "profilestudent",
            username : req.query.user // get the user out of session and pass to template			
        });
	});

	app.post('/addpublication',isLoggedIn,function(req,res){
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
	       // 	    var workobj = { 
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





	
	
	
	//=====================================
    // Get Course Info. ==============================
    // =====================================
	app.get('/course_inf',function(req,res){
		res.render('profile_inf.ejs', { message: req.flash('profile') });
	});
	
	
	//=====================================
	// Workflow. ==============================
	// =====================================
	//app.get('/workflow', function(req, res){
	//	res.render('wf/index.hbs',{
	//		layout:"workflowMain"
	//	});
	//});

	app.get('/workflow', function(req, res){
	TemplateWorkflow.find({}, function(err, result){

		if(err) console.log(err);

		res.render('wf/execute.hbs', 
			{ layout: "workflowMain",workflows : result });
		});

	});

	app.get('/create', function(req, res){
		res.render('wf/create.hbs',
			{layout:"workflowMain"});
	});

	app.post('/save', function(req, res){

		var tpWorkflow = new TemplateWorkflow( { 
			name: req.body.name, 
			description: req.body.description,
			xml: req.body.xml  
		} );
	
		tpWorkflow.save(function (err) {
			if(!err){
				console.log('Save template workflow !!!');
				res.end('succesful');
			}
			else{
				console.log(err);
				res.end('failed');
				}

		});
	});

  app.use('/form', formController);
	app.get('/:id/profile', function(req, res){
		
		TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){

			res.render('wf/single/profile.hbs', 
				{ layout:"workflowMain",workflow: result } );
		});	

	});


	app.get('/:id/execute', function(req, res){

		TemplateWorkflow.findOne( { "_id" : req.params.id }, function(err, result){
			var xml = result.xml;

			parseString(xml, function (err, strResult) {

				var elements = strResult["bpmn2:definitions"]["bpmn2:process"][0];
				var keys = Object.keys( elements );


				var handler = new WorkflowHandler();

			
				handler.setup( elements );
				handler.run();
		
	    		res.render( "workflow/single/execute.hbs", { 
	    			layout:"workflowMain",
	    			tasks : handler.taskList,
	    			id : req.params.id
	    		});
			});
		});
	});


	app.post('/:id/execute', function(req, res){

		res.end("DONE");

	});

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

	

};

//route middleware to make sure user is logged in as Admin
function isAdmin(req,res,next){

	if(req.user.local.name == "admin")
		return next();

	res.redirect('/');
}

