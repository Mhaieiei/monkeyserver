 var express      = require('express');
var router        = express.Router();
var parseString     = require('xml2js').parseString;
//var runner        = require('./runner');
var async         = require('async');
var mongoose      = require('mongoose');
var User                     = require('../../model/user');
var Work                     = require('../../model/works');
var Program                  = require('../../model/program');
var Fac                      = require('../../model/faculty');
var Subject                  = require('../../model/subject');
var Acyear                   = require('../../model/academic_year');
var Teach                    = require('../../model/teaching_semester');
var TemplateWorkflow         = require('../../model/TemplateWorkflow');
var Doc                      = require('../../model/document/document');
var Subenroll                = require('../../model/subject_enroll');
var Stdenroll                = require('../../model/student_enroll');
var FacilityAndInfrastruture = require('../../model/FacilityAndInfrastrutureSchema');
var AssesmentTool            = require('../../model/assesmentToolSchema');
var ReferenceCurriculum      = require('../../model/referenceCurriculumSchema');
var Role                     = require('../../model/role');
var Responsibility           = require('../../model/Responsibility');

var isLoggedIn = require('middleware/loginChecker');


//-------------------------------------------------add ELOs-------------------------------------------------------

router.get('/', isLoggedIn, function (req, res) {
      console.log("aun21-refCurriculum");

      

      Program.find({ 'programname': req.query.program })
            .populate('referenceCurriculum')
            .populate('structureOfCurriculum')
             .exec(function (err, struc) {
              console.log("struc: "+struc);
                 // console.log("REFFFF--subs-->>>", subs);


                        Acyear.findOne({
                            $and: [
                                   { 'program_name': req.query.program },
                                   { 'academic_year': req.query.year }
                            ]
                        }, function (err, programs) {
                            if (!err) {
                              console.log("req.query.program: "+req.query.program);
                              console.log("req.query.year: "+req.query.year);
                              console.log("programs: "+programs);
                                console.log("programs._id: "+programs._id);
                                //referenceCurriculumSchema.find();
                                Teach.find({ 'ac_id': programs._id }).sort({ "Year": 1 })
                               
                                .populate('subject.subcode')
                                .exec(function (err, docs) {
                                    Teach.populate(docs, {
                                        path: 'subject.subcode',
                                        model: 'Subject'
                                    },
                                    function (err, subs2) {


                                        console.log("REFFFF--2-->>>", subs2);

                                        var index = 0;
                                        res.render('qa/qa-aun2.1.ejs', {
                                            //    user: req.user,      
                                            layout: "qaPage",
                                            struc:struc,
                                            //docs: subs,
                                            subs:subs2,
                                            programname: req.query.program,
                                            year : req.query.year,
                                            acid : req.query.acid,
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
                                return console.log("AUN2-1 err"+err );
                            }
                        });

                        

                  

             });

});

//-------------------- add references curriculumns--------------------------------------------

router.get('/addref2-1',isLoggedIn,function(req,res){
      console.log('Add ref aun 2-1')
      res.render("qa/editqa/add_ref_cur.hbs",{
        layout : 'adminPage',
        programname : req.query.program,
        year : req.query.year,
        acid : req.query.acid
      });

});

router.post('/addref2-1',isLoggedIn,function(req,res){
    console.log('post add ref aun2-1')

    console.log(req.body.programname)
    console.log(req.body.acid)
    console.log(req.body.year)
    console.log(req.body.program);
    console.log(req.body.degree);
    console.log(req.body.uni);
    console.log(req.body.country);
    console.log(req.body.web);
    ReferenceCurriculum.findOne({
      $and : [
              {'refProgramname': req.body.program},
              {'degree' : req.body.degree}
             ]
    },function(err,ref){
      if(err) console.log('cant query ref'+err)
      if(ref != null){
        console.log('this ref has already')
        
      }else{
        var refcur = new ReferenceCurriculum();
          refcur.refProgramName = req.body.program;
          refcur.degree         = req.body.degree;
          refcur.university     = req.body.uni;
          refcur.country        = req.body.country;
          refcur.website        = req.body.web;

          refcur.save(function(err,result){
              if(err) console.log('cant save new referrence'+err)
              else{
                console.log('update referene already'+result.id)
                Program.findOne({'programname': req.body.programname},function(err,program){
                  if(err) console.log('cant query program'+err)
                    console.log(program);
                    program.referenceCurriculum.push(result.id);

                    program.save(function(err,result2){
                      if(err) console.log('cant insert id of ref to program')
                      else{
                        console.log('Insert id already')
                        res.redirect('/admin/showprogram?id='+req.body.acid+"&program="+req.body.programname);
                      }
                    })
                 

                })

              }
          });
      }

    });
});

router.get('/editref2-1',isLoggedIn,function(req,res){
    console.log('Edit ref aun 2-1');
    console.log(req.query.id);
    ReferenceCurriculum.findById(req.query.id,function(err,ref){
      console.log(ref);
      res.render("qa/editqa/edit_ref_cur.hbs",{
        layout : 'adminPage',
        referene : ref,
        refid : req.query.id,
        programname : req.query.program,
        year : req.query.year,
        acid : req.query.acid
      });
    });

});

router.post('/editref2-1',isLoggedIn,function(req,res){
    console.log('[Post]Edit ref aun 2-1');
    console.log(req.body.id);
    ReferenceCurriculum.findById(req.body.id,function(err,ref){
        ref.refProgramName = req.body.program;
        ref.degree         = req.body.degree;
        ref.university     = req.body.uni;
        ref.country        = req.body.country;
        ref.website        = req.body.web;
        ref.save(function(err,result){
              if(err) console.log('cant update referrence'+err)
              if(result){
                console.log('update referene already'+result.id)
                res.redirect('/admin/showprogram?id='+req.body.acid+"&program="+req.body.programname);
              }   
          });       
    });

});

router.get('/delref2-1',isLoggedIn,function(req,res){
    console.log("[Post]Admin Delete ref aun2-1");
   ReferenceCurriculum.remove(
          { '_id' : req.query.id },
          function(err, results) {
          if (err){console.log('delete ref err'+err);}
          else console.log("delete already");
          }
       );
    Program.findOneAndUpdate({ 'programname' : req.query.program },
      {
       "$pull" : {
        "referenceCurriculum" : req.query.id
           }
        },function (err, programedit) {
          if (err){console.log('Cant delete referenceCurriculum of program'+err);}
          else {console.log('Delete referenceCurriculum of program already'+ programedit);}
      });
      res.redirect('/admin/showprogram?id='+req.query.acid+"&program="+req.query.program);
});

//---------------------------------add Structure of curriculum -----------------------------

router.get('/addstruc2-1',isLoggedIn,function(req,res){
      console.log('Add struc 2-1')
      res.render("qa/editqa/add_strucCur.hbs",{
        layout : 'adminPage',
        programname : req.query.program,
        acid : req.query.acid
      });

});

router.post('/addstruc2-1',isLoggedIn,function(req,res){
    console.log('post add struc2-1')

    console.log(req.body.program)
    console.log(req.body.acid)
    //console.log(req.body.year)
    console.log(req.body.plan)
    console.log(req.body.arrlen)
    
    var strlen = req.body.arrlen; 
    var array = [];    
    //advisee
    for(var i=0;i< strlen;i++){
      if(strlen == 1){
         var obj = {
          'type' : req.body.type,
          'subjectType' : req.body.subtype,
          'creditRequired' : req.body.credit,
          
        }       
      }else{
         var obj = {
          'type' : req.body.type[i],
          'subjectType' : req.body.subtype[i],
          'creditRequired' : req.body.credit[i],
        }     
      }
              
        array.push(obj);
     }   

    Teach.Structure.findOne({
      $and : [
              {'program': req.body.program},
              {'plan' : req.body.plan}
             ]
    },function(err,teach){
      if(err) console.log('cant query teach'+err)
      if(teach != null){
        console.log('this teach has already')
               
      }else{
        var struct = new Teach.Structure();
          struct.plan               = req.body.plan;
          struct.program            = req.body.program;
          struct.knowledgeBlock     = array;
         

          struct.save(function(err,result){
              if(err) console.log('cant save new referrence'+err)
              else{
                console.log('update referene already'+result.id)
                Program.findOne({'programname': req.body.program},function(err,program){
                  if(err) console.log('cant query program'+err)
                    console.log(program);
                    program.structureOfCurriculum.push(result.id);

                    program.save(function(err,result2){
                      if(err) console.log('cant insert id of teach to program')
                      else{
                        console.log('Insert id already')
                        res.redirect('/admin/showprogram?id='+req.body.acid+"&program="+req.body.program);
                      }
                    })
                 

                })

              }
          });
      }

    });
});



router.get('/editstruct2-1',isLoggedIn,function(req,res){
    console.log('Edit struc 2-1');
    console.log(req.query.id);
    Teach.Structure.findById(req.query.id,function(err,struc){
      console.log(struc);
      res.render("qa/editqa/edit_strucCur.hbs",{
        layout : 'adminPage',
        struc : struc,
        struclen : struc.length,
        strucid : req.query.id,
        programname : req.query.program,
        acid : req.query.acid
      });
    });

});

router.post('/editstruct2-1',isLoggedIn,function(req,res){
    console.log('[Post]Edit ref aun 2-1');
    console.log(req.body.structid);
    var strlen = req.body.arrlen; 
    var array = [];    
    //advisee
    for(var i=0;i< strlen;i++){
      if(strlen == 1){
         var obj = {
          'type' : req.body.type,
          'subjectType' : req.body.subtype,
          'creditRequired' : req.body.credit,
          
        }       
      }else{
         var obj = {
          'type' : req.body.type[i],
          'subjectType' : req.body.subtype[i],
          'creditRequired' : req.body.credit[i],
        }     
      }
              
        array.push(obj);
     }   

    Teach.Structure.findById(req.body.structid,function(err,teach){
        teach.plan               = req.body.plan;
        teach.program            = req.body.program;
        teach.knowledgeBlock     = array;
        teach.save(function(err,result){
              if(err) console.log('cant update referrence'+err)
              if(result){
                console.log('update struct already'+result.id)
                res.redirect('/admin/showprogram?id='+req.body.acid+"&program="+req.body.program);
              }   
          });       
    });

});
 
router.get('/delstruct2-1',isLoggedIn,function(req,res){
    console.log("[Post]Admin Delete struct aun2-1");
   Teach.Structure.remove(
          { '_id' : req.query.id },
          function(err, results) {
          if (err){console.log('delete struct err'+err);}
          else console.log("delete already");
          }
       );
    Program.findOneAndUpdate({ 'programname' : req.query.program },
      {
       "$pull" : {
        "structureOfCurriculum" : req.query.id
           }
        },function (err, programedit) {
          if (err){console.log('Cant delete structureOfCurriculum of program'+err);}
          else {console.log('Delete structureOfCurriculum of program already'+ programedit);}
      });
      res.redirect('/admin/showprogram?id='+req.query.acid+"&program="+req.query.programname);
});

 

module.exports = router;