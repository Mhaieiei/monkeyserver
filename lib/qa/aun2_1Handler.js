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

router.get('/addaun2-1',isLoggedIn,function(req,res){
      console.log('Add aun 2-1')
      res.render("qa/editqa/edit_ref_cur.hbs",{
        layout : 'qaPage',
        programname : req.query.program,
        year : req.query.year,
        acid : req.query.acid
      });

});

router.post('/addaun2-1',isLoggedIn,function(req,res){
    console.log('post add aun2-1')

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
                        res.redirect('/aun/aun2-1?program='+req.body.programname+'&year='+req.body.year+'&acid='+req.body.acid);
                      }
                    })
                 

                })

              }
          });
      }

    });
});

 

 

module.exports = router;