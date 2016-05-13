
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

var isLoggedIn = require('middleware/loginChecker');
var years = [2012,2013,2014,2015,2016];
var yearlevel = [1,2,3,4];
var dialog = require('dialog');


 

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
              console.log('ref structure'+ ref.structureOfCurriculum)
              console.log('ref curriculum'+ ref.referenceCurriculum)
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

//subject section======================================================================================================================

router.get('/subjects',isLoggedIn,function(req,res){
    console.log('Admin Get Subject select');
    return Fac.find({}, function( err, faculty ) {
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

router.post('/subjects',isLoggedIn,function(req,res){
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
      res.redirect('/admin/showsubject?acid='+ac.id+'&program='+ac.program_name+'&acyear='+ac.academic_year);
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
                 res.redirect('/admin/showsubject?acid='+acc.id+'&program='+acc.program_name+'&acyear='+acc.academic_year);                 
                }
            });
          
         }
        });
  
});

router.get('/showsubject',isLoggedIn,function(req,res){
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
	              acid : req.query.acid,
                program:req.query.program,
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
  
router.get('/addsubjects',isLoggedIn,function(req,res){
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

router.post('/addsubjects',isLoggedIn,function(req,res){
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
              res.redirect('/admin/subjects');
              console.log("done");
          });
                
               
            }

        });  
});

    //delete subject information.
router.get('/delsub',isLoggedIn,function(req,res){
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
    res.redirect('/admin/subjects');
});
    //edit education information.
router.get('/editsubject',isLoggedIn,function(req,res){
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
  
router.post('/editsubjects',isLoggedIn,function(req,res){
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
                          res.redirect('/admin/showsubject?acid='+req.query.acid+'&program='+acc.program_name+'&acyear='+acc.academic_year);
                          });

                        }

                        }); 

                        }
          
                      
                      }); 
          });      
     

      
    });
});











module.exports = router;


