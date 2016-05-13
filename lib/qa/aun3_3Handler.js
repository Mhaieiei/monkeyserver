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
      console.log("knowledgeAndSkill");

      //referenceCurriculumSchema.find();
      var p_id;
      Acyear.findOne({
          $and: [
                   { 'program_name': req.query.program },
                   { 'academic_year': req.query.year }
          ]
      }, function (err, programs) {
          if (!err) {
              console.log(programs._id);
              //referenceCurriculumSchema.find();
              p_id = programs._id;

              } else {
              //res.redirect('/fachome');
              return console.log(err + "mhaieiei");
          }

          console.log("p_id: "+p_id);

              Teach.aggregate(

            [
                    {
                        $match: {
                            $and: [
                                { 'ac_id': String(p_id)},
                                { 'plan': { $exists: true } }

                            ]

                        }
                    },

                    
                    {
                        $group: {
                            _id: "$plan",
                            root: { $push: "$$ROOT" },
                            

                        }
                    }

            ]
        , function (err, docs) {

          console.log("studentStatus-------------------->:"+docs);
              
                Teach.populate(docs, {
                        path: 'root.subject.subcode',
                        model: 'Subject'
                    },
                    function (err, pop_sub) {
                    Teach.populate(pop_sub, {
                        path: 'root.subject.subcode.ELO.ELO',
                        model: 'Subject'
                    },
                    function (err, subs) {

                      Subject.ELO.find( {
                      $and: [
                             { 'eloFromTQF': { $exists: true } },
                             { 'program': req.query.program }
                            ]
                      },function( err, elo ) { 

                        console.log("ELO-------------------->:"+elo);
                        console.log("ELO-------------------->:"+elo.length);


                        console.log("REFFFF---->>>", subs);

                        res.render('qa/qa-aun3.3.ejs', {
                            //    user: req.user,      
                            layout: "qaPage",
                            docs: subs,
                            programname : req.query.program,
                            year : req.query.year,
                            acid : req.query.acid,
                            elo:elo,
                            len:elo.length,
                            // newList:newList
                        });
                       
                    //     //, function (err, docs) {


                    // });
                      });
                    });
                });
                 });
          
      });
  });

 function groupBy( array , f )
{
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );  
  });
  return Object.keys(groups).map( function( group )
  {
    return groups[group]; 
  })
}

 

module.exports = router;