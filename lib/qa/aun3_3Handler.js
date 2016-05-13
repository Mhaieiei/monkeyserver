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
              // Teach.find({
              //     $and: [
              //       { 'ac_id': programs._id },
              //     { 'plan': { $exists: true } }
              //     ]
              // })
                
              //   .populate('subject.subcode')
              //   .exec(function (err, docs) {
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

                 

                  
                  // console.log("acc---2----->>>", subs.length);
                  // var keep_newList = [];
                  // var people = Object.keys(subs);
                  // array_keep_topic = []
                  // people.forEach(function(k_dev) {

                  //   var items = Object.keys(subs[k_dev]);

                  //   items.forEach(function(item) {
                  //     var value = subs[k_dev][item];
                  //     console.log(k_dev+': '+item+' = '+value);
                  //     keep_newList = [];
                  //     obj_plan = {'plan':value};
                  //      if (item == 'root'){

                          

                  //         var items2 = Object.keys(subs[k_dev][item]);
                  //         items2.forEach(function(item2) {
                  //           var value = subs[k_dev][item][item2];
                  //           console.log(k_dev+':1 '+item+':2 '+item2+' = '+value);

                           
                  //             var value = subs[k_dev][item][item2]["subject"];
                  //             console.log(k_dev+':1 '+item+':2 '+item2+':3 '+"subject"+' = '+value);
                  //             var check = 0;
                              
                  //             var temp = value;
                  //             var newList;
                  //             var newSub;
                  //             // var obj_temp = {"type":"","subject":""}
                  //               value.reduce(function(acc, item) { 
                  //               console.log("acc--bf-->>>", acc); 
                  //                 console.log("item-item.subcode.sub_topi--->>>", item.subcode.sub_topic);
                  //               // var key = "type";//item.subcode.sub_topic;
                  //               // acc[key] = {};
                  //               if(item.subcode.sub_topic!=null){
                  //                 // console.log("acc[key]-------->>>", acc[key]);
                  //                 acc.forEach(function(test) {
                  //                   // console.log("aTEST------->>>", test);

                  //               if (item.subcode.sub_topic == test.topic){
                  //                 test.item.push(item);
                  //                 check = 1;
                  //               }

                                
                  //             });
                  //                 if(check == 0){
                  //                   var temp_obj = {"topic":item.subcode.sub_topic,"item":[item]}
                  //                   acc.push(temp_obj);
                  //                   console.log("acc-----------new obj------------>>>", acc);

                  //                 }
                  //                 check=0;
                  //               }

                             
                  //               // acc[key] = acc[key] || [];
                  //               // temp.reduce(function(keep_sub, item2) { 
                  //               //   var key_type = String(item2.subcode.sub_type); 
                  //               //   keep_sub[key_type] = keep_sub[key_type] || [];
                  //               //   keep_sub[key_type].push(item2);
                  //               //   newSub = keep_sub;

                  //               //   return keep_sub;
                              
                  //               //  }, {});
                  //               // console.log("newSub--af-->>>", newSub);
                  //               // acc[key].push(item);
                  //               console.log("acc--af-->>>", acc);
                  //               newList = acc;
                  //               return acc;
                              
                  //                }, []);

                                
                  //               console.log("NEWLIST--->"+newList); //per semes per year level
                  //               console.log('-------------------------------------------------------------------');
                  //               keep_newList.push(newList);
                  //               // subs +={"groupType":newList}
                  //               // var people = Object.keys(newList);
                  //               // people.forEach(function(person) {
                  //               //   // obj_plan +={"topic": person};
                                  

                  //               //   var items = Object.keys(newList[person]);

                  //               //   items.forEach(function(item) {
                  //               //     var value = newList[person][item];
                  //               //     // console.log(person+': '+item+' = '+value);

                  //               //     var items2 = Object.keys(newList[person][item]);
                  //               //     items2.forEach(function(item2) {
                  //               //     var value = newList[person][item][item2];

                  //               //     // console.log(person+':1 '+item+':2 '+item2+' = '+value);

                  //               //     var items3 = Object.keys(newList[person][item][item2]);
                  //               //     items3.forEach(function(item3) {
                  //               //     var value = newList[person][item][item2][item3];
                  //               //     // console.log(person+':1 '+item+':2 '+item2+':3 '+item3+' = '+value);
                                    
                  //               //     var value4 = newList[person][item][item2][item3]["subcode"];
                  //               //     console.log(person+':1 '+item+':2 '+item2+':3 '+item3+':4 subcode = '+value4);
                                    
                                    
                  //               //     });
                                    
                  //               //   });
                  //               // });
                  //               //   });
                                
                              
                            

                  //         });

                       
                  //   }
                  //   console.log('444444444444444444444444444444444444444444444444444444444444444444444444444444');
                  //   console.log('keep_newList per plan' + keep_newList);
                  //   var check = 0;
                  //   var combine_plan;
                  //   keep_newList.reduce(function(keep_plan, item) { 
                  //               console.log("keep_newList---------item-->>>", item); 
                  
                  //                 // console.log("acc[key]-------->>>", acc[key]);
                  //       keep_plan.forEach(function(test) {
                  //         console.log("TEST---2---->>>", test);
                  //     if (item.topic == test.topic){
                  //       test.item.push(item);
                  //       check = 1;
                  //     }

                      
                  //   });
                  //       if(check == 0){
                  //         var temp_obj = {"topic":item.topic,"item":item}
                  //         keep_plan.push(temp_obj);
                  //         console.log("keep_plan-----------new obj-------2----->>>", keep_plan);

                  //       }
                  //       check=0;
                  //       console.log('*********** '+keep_plan);
                  //   combine_plan = keep_plan;
                  //   return keep_plan;
                  
                  //    }, []);
                  //   console.log('444444444444444444444444444444444444444444444444444444444444444444444444444444');

                  //   });

                  // });

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