var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/roleManagement');

router.get('/',function(req, res){

	//load data
	var result = [
		{	
			name: "Staff AB",
			description: "บริหารส่วนบุคคล" 
		}
	]
	res.render('wf/roles/rolePage.hbs',  { layout: 'homePage', data: result } );
});

router.get('/createRole',function(req,res){
	res.render('wf/roles/editRole.hbs',{ layout:'homePage' });
});

module.exports = router;