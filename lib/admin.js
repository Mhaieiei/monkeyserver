
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
      res.redirect('/admin/showprogram?id='+ac.id);
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
                 res.redirect('/admin/showprogram?id='+acc.id);                 
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
      console.log(req.query.id);
      var acayear = req.query.id;
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
	        Work.Meeting.find( { 
	          $and: [
	                     { '_type' :  'meetingOfProgram' },
	                     {  'acyear' : req.query.id}
	               ]      
	        }, function (err, meeting) {
	          if(err) console.log("query meetings err"+err);
	          console.log(meeting);
	          res.render("admin/faculty/program/showprogram.hbs", {
	              layout: "adminPage",
	              user : req.user,
	              teachsemes: subs,
	              meetings : meeting,
	              year : years,
	              acid : req.query.id,
	              helpers: {
	              inc: function (value) { return parseInt(value) + 1; },
	              getacid: function () { return acayear; }
	            } 
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
    .findOne({ $and: [
           { 'ac_id' : req.query.id },
               { 'Year' : req.query.year },
               { 'semester' : req.query.semes }
             ]
      }).populate('subject.subcode')
    .exec(function(err, docs) {
      if(err) return callback(err);
      console.log(docs.subject[0].subcode);
      Teach.populate(docs, {
        path: 'subject.subcode.sub_lecter',
        model: 'User'
      },function(err, subs) {
        if(err) return callback(err);
          // This object should now be populated accordingly.
        console.log(subs);
        console.log(subs.subject.length);
        //console.log(subs.subject[0].subcode.sub_code);
        //console.log(subs.subject[0].subcode.sub_lecter[0]);
          res.render("admin/faculty/program/editsubprogram.hbs", {
              layout: "adminPage",
              user : req.user,
              subprogram: subs,
              len : subs.subject.length,
              acid : req.query.id,
              year : years,
              helpers: {
              inc: function (value) { return parseInt(value) + 1; }              
              } 
           
             });
      });
    });
});

router.get('/addsubprogram',isLoggedIn,function(req,res){
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
            




          res.redirect('/admin/showprogram?id='+req.body.acid);
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
    res.redirect('/admin/showprogram?id='+req.query.acid);  

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
                    res.redirect('/admin/showprogram?id='+req.body.acyear);                    
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
                 res.redirect('/admin/showprogram?id='+req.body.acyear);                     
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
    res.redirect('/admin/showprogram?id='+req.query.acid);    
    
});



module.exports = router;
