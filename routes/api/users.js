var router = require('express').Router();
var User = require('model/user');

router.get('/:id',function(req,res, next){
      console.log("get api user id");
      var id = req.params.id;
      console.log(id);
      User.findById(id, function(err, result){
        if(err){
            console.log("api err"+err);
            return next(err);
        }
        res.json(result);
      }); 

});

router.get('/',function(req,res, next){
  console.log("get api users");

  console.log( req.query.fields );
  var fields = '';
  if( req.query.fields ){
    fields = req.query.fields;
  }

  User.find({}, fields, function(err, result){
    if(err){
        console.log("api err"+err);
        return next(err);
    }
    res.json(result);
  }); 

});


module.exports = router;