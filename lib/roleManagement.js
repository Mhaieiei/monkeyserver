var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/roleManagement');

router.get('/',function(req, res){

	//load data here (load from mongoDB)
	var result = [
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
	res.render('wf/roles/rolePage.hbs',  { layout: 'homePage', data: result } ); // first paramater is layout about the page & second paramater is the data that load from the database 
});

router.get('/createRole',function(req,res){
	res.render('wf/roles/editRole.hbs',{ layout:'homePage' });
});

module.exports = router;