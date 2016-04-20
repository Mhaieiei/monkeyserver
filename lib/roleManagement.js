var express 			= require('express');
var router  			= express.Router();
var TemplateWorkflow	= require('../model/roleManagement');

router.get('/',function(req, res){
	res.render('wf/roles/rolePage.hbs',  { layout: 'homePage' } );
});

module.exports = router;