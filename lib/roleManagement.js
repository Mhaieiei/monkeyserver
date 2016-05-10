var express 			= require('express');
var router  			= express.Router();
var request				= require('request');
var roleManagementModel	= require('../model/simpleRole');
var members = [];

router.get('/test',function(req,res){
	request('http://localhost:5000/api/users', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body)
	  }
	  if(error){
	  	console.log(error);

	  }
	  res.end('xxxx');
	});
});

router.get('/',function(req, res){

	//load data here (load from mongoDB)
	roleManagementModel.find({},function(err,result){
		if (err)console.log(err);
		res.render('wf/roles/rolePage.hbs',  { layout: 'homePage', data: result } );
	})
	
});

router.get('/createRole',function(req,res){
	request('http://localhost:5000/api/users?fields=_id',function(error,response,body){
		var json = JSON.parse(body);
		console.log(typeof json);
		res.render( 'wf/roles/editRole.hbs',{ layout:'homePage',users:JSON.stringify(json) } );
	});
});

router.post('/save',function(req,res){
	var roleModel = new roleManagementModel({
		name:req.body.name,
		description:req.body.description,
		members: req.body.members
	});
	res.redirect('/roleManagement');
	roleModel.save(function(err){
		if(!err){
			console.log('Save new simple role !!');
		}
		else{
			console.log(err);
			res.end('failed');
		}
	});
});
router.get('/:id/editRole',function(req,res){
	request('http://localhost:5000/api/users',function(error,response,body){
		var json;
		json = JSON.parse(body);

		roleManagementModel.findOne({"_id" : req.params.id},function(err,result){
		console.log(result);
		res.render('wf/roles/singleRow/editRole.hbs',{
			layout:"homePage",allData:{data1: result ,data2: json}});
		});
	});
	// load indiviual role
	/*roleManagementModel.findOne({"_id" : req.params.id},function(err,result){
		console.log(result);
		res.render('wf/roles/singleRow/editRole.hbs',{
			layout:"homePage",allData:{data1: result ,data2: json}});
	});*/
});


router.get('/:id/delete',function(req,res){
	//detele
	roleManagementModel.find({"_id" : req.params.id}).remove(function(err,result){
		console.log(result);
		res.redirect('/roleManagement');
	});
});

module.exports = router;