var express 			= require('express');
var router  			= express.Router();
var roleManagementModel	= require('../model/roleManagement');

router.get('/',function(req, res){

	//load data here (load from mongoDB)
	roleManagementModel.find({},function(err,result){
		if (err)console.log(err);
		res.render('wf/roles/rolePage.hbs',  { layout: 'homePage', data: result } );
	})
	
	/*var result = [
		{
			name: "Staff AA",
			description: "บริการสารบรรณ"
		},
		{	
			name: "Staff AB",
			description: "บริหารส่วนบุคคล" 
		},
		{
			name: "Staff AC",
			description: "บริหารประกัน"
		}
	]

	res.render('wf/roles/rolePage.hbs',  { layout: 'homePage', data: result } ); */ // first paramater is layout about the page & second paramater is the data that load from the database 
});

router.get('/createRole',function(req,res){
	res.render('wf/roles/editRole.hbs',{ layout:'homePage' });
});

router.post('/save',function(req,res){
	var roleModel = new roleManagementModel({
		name:req.body.name,
		description:req.body.description
	});
	roleModel.save(function(err){
		if(!err){
			console.log('Save new simple role !!');
			res.redirect('/roleManagement');

		}
		else{
			console.log(err);
			res.end('failed');
		}
	});
});
router.get('/:id/editRole',function(req,res){
	// load indiviual role
	roleManagementModel.findOne({"_id" : req.params.id},function(err,result){
		console.log(result);
		res.render('wf/roles/singleRow/editRole.hbs',{
			layout:"homePage",data: result });
	});
});
router.get('/:id/delete',function(req,res){
	//detele
	roleManagementModel.find({"_id" : req.params.id}).remove(function(err,result){
		console.log(result);
		res.redirect('/roleManagement');
	});
});

module.exports = router;