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

router.get('/tqf21',function(req,res){
      console.log('Get TQF21');
      console.log(req.query.program);
      console.log(req.query.year);
      console.log(req.query.acid);
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
              programname : req.query.program,
              year : req.query.year,
              acid : req.query.acid,
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
    
  
router.get( '/tqf22',isLoggedIn, function( req, res ) {
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
                  programname : req.query.program,              
                  year: req.query.year,
                  acid : req.query.acid,
                  helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getyear:function(value) {return yearac[value];},
                  getindex:function() {return index++;}}

                });
        }); 
      });           
      
      
   
  });
  

router.get('/tqf23',isLoggedIn,function(req,res){
    console.log("tqf23");
    console.log("change state");
    console.log(req.query.acid);
    //console.log(req.query.program);
    //var id = mongoose.Types.ObjectId('56d14d1c8393baa816709274');
    Work.Project.aggregate([
        {
            $match:  { $and: [
              { 'acyear' : req.query.acid },
              { '_type' : 'advisingProject' }
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
        console.log("The result after aggregate is "+result);
        //console.log(result[0].works);
        //console.log(result[1].works);
        Work.Project.populate(result,{path:'_id',model:'User'},function(err,userwork){
          if(err){console.log("first populate is err"+err);}
          console.log(userwork);
          //console.log(userwork[0].works[0].roleuser);
          Work.Project
        .find({ $and: [
              { 'acyear' : req.query.acid  },
              { '_type' : 'advisingProject' }
        ]})
        .populate({
          path:'user.iduser',
          model : 'User'
        }).exec(function(err, works) {
            if(err) console.log("find teach err"+err);
              // This object should now be populated accordingly.
              console.log("The lastest result"+works);
              
              res.render('qa/tqf23.ejs', {
                //layout: "qaPage",
              user : req.user,
              examiner : userwork,
              Thesis: works,   
              programname : req.query.program,              
              year: req.query.year,
              acid : req.query.acid,             
                  

                  }); 
        });   

        });
        
           
      });

  });

router.get('/tqf24',isLoggedIn,function(req,res){
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
        //console.log(result[0].works);
        //console.log(result[1].works);
        Work.Public.populate(result,[{path:'_id',model:'User'},{path:'works.workid',model:'Public'}],function(err,userwork){
          if(err){console.log("first populate is err"+err);}
          console.log("Userwork is"+userwork);
           Work.Project
        .find({'acyear': req.query.acid})
        .populate({
          path:'user.iduser',
          model : 'User'
        }).exec(function(err, works) {
            if(err) console.log("find teach err"+err);
              // This object should now be populated accordingly.
              //console.log(works);
              //console.log(works[0].nametitle);
              //console.log(works[0].user[0].iduser.local.username);
              res.render('qa/tqf24.ejs', {
              user : req.user,
              examiner : userwork,
              Thesis: works,
              programname : req.query.program,              
              year: req.query.year,
              acid : req.query.acid,                   
                  }); 
        });   

        });
        
           
      });

  });

router.get('/tqf25',isLoggedIn,function(req,res){
    console.log("tqf25 Program Management");
    console.log(req.query.acid);
    console.log(req.query.program);
    var acyear =  req.query.year;
    Work.Meeting.find( { 
          $and: [
                     { '_type' :  'meetingOfProgram' },
                     {  'acyear' : req.query.acid}
               ]      
        }, function (err, meeting) {
          if(err) console.log("query meetings err"+err);
          console.log(meeting);
          Program.findOne({ 'programname' :  req.query.program  }, function(err, manage) {        
              if (err){ console.log("Cant find factory management"+err); } 
               res.render("qa/tqf25.hbs", {
                  layout: "qaPage",
                  meetings : meeting,
                  acid : req.query.acid,
                  manage : manage,
                  programname : req.query.program,              
                  year: req.query.year,
                  acid : req.query.acid,   
                  helpers: {
                  inc: function (value) { return parseInt(value) + 1; },
                  getyear: function () { return acyear; }
                 } 
               });
            });              
        });
         
  });

//------------------------edit tqf 25 ----------------------------------------------------------------------
router.get('/edittqf25',isLoggedIn,function(req,res){
    console.log("[GET]Edit tqf 25");
    console.log(req.query.name);
    console.log(req.query.acid);
    console.log(req.query.year);
    console.log(req.query.program);
    Program.findOne({ 'programname' :  req.query.program  }, function(err, manage) {        
        if (err){ console.log("Cant find factory management"+err); }        
        if (manage != null) {
          console.log("Edit"+manage);
          res.render('qa/editqa/tqf25edit.hbs', {
            layout: "qaPage",
            acid : req.query.acid,
            year : req.query.year,
            program : req.query.program,
            manage : manage,
            len : manage.Programmanagement.length
            });

        } else {
            console.log("Insert new");
            res.render('qa/editqa/tqf25new.hbs', {
            layout: "qaPage",
            acid : req.query.acid,
            year : req.query.year,
            program : req.query.program          
            });            
        }
    });
    
  });
router.post('/edittqf25',isLoggedIn,function(req,res){
    console.log("[POST] Edit tqf 25");
    console.log(req.body.indicators);
    console.log(req.body.target);
    console.log(req.body.actions);
    console.log(req.body.results);
    console.log(req.body.program);
    console.log(req.body.acid);
    console.log(req.body.year);
    console.log(req.body.arrlen);
        
    var strlen = req.body.arrlen; 
    var userarr = [];
    var array = [];    
    //advisee
    for(var i=0;i< strlen;i++){
      if(strlen == 1){
         var obj = {
          'indicators' : req.body.indicators,
          'target' : req.body.target,
          'actions' : req.body.actions,
          'results' : req.body.results
        }       
      }else{
         var obj = {
          'indicators' : req.body.indicators[i],
          'target' : req.body.target[i],
          'actions' : req.body.actions[i],
          'results' : req.body.results[i]
        }     
      }
              
        array.push(obj);
     }       
    Program.findOne({ 'programname' :  req.body.program  }, function(err, fac) {        
        if (err){ console.log("Cant find faculty management"+err); }        
        if (fac != null) {
          console.log(fac);
          fac.Programmanagement = array;
          fac.save(function(err,manage) {
            if (err){console.log('cant edit new program Management'+err);}  
            else{
              console.log(manage);
              console.log("Update new program management succesful");  
              res.redirect('/tqf/tqf25?acid='+req.body.acid+'&year='+req.body.year+'&program='+req.body.program);                          
            }                         
         });  

          } else {
             var managefac = new Program();
                managefac.programname = req.body.program;
                managefac.Programmanagement = array;
            managefac.save(function(err,manage) {
            if (err){console.log('cant make new program Management'+err);}  
            else{
              console.log(manage);
              console.log("Insert new program management succesful");  
              res.redirect('/tqf/tqf25?acid='+req.body.acid+'&year='+req.body.year+'&program='+req.body.program);                          
            }                         
            });  

             
          }
        });
    
     });       

module.exports = router;