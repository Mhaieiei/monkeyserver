var express 			= require('express');
var router  			= express.Router();
var request				= require('request');
var roleManagementModel	= require('model/simpleRole');
var User 				= require('model/user');
var members = [];

router.get('/test',function(req,res){
	var baseUrl = req.protocol + '://' + req.get('host');
	request(baseUrl + '/api/users', function (error, response, body) {
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

router.get('/new',function(req,res){
	var baseUrl = req.protocol + '://' + req.get('host');
	request( baseUrl + '/api/users?fields=_id',function(error,response,body){
		var json = JSON.parse(body);
		console.log(typeof json);
		res.render( 'wf/roles/editRole.hbs',{ 
			layout:'homePage',
			title: 'New role',
			roleName: '',
			roleDescription: '',
			members: JSON.stringify([]),
			users:JSON.stringify(json) 
		});
	});
});

router.post('/:id/update', function(req, res){

	roleManagementModel.update( { '_id': req.params.id }, {
		name:req.body.name,
		description:req.body.description,
		members: req.body.members
	}, function(err){
		if(!err){
			User.update( { '_id' : {'$in':req.body.members}}, { 'simpleRole': req.params.id }, {multi: true},
				
				function(err){
					if(!err){
						console.log('Save new simple role !!');
						res.end('Save success');
					}else{
						console.log(err);
						res.end('failed');
					}
			});		
		}
		else{
			console.log(err);
			res.end('failed');
		}
	});

});

router.post('/new',function(req,res){
	var roleModel = new roleManagementModel({
		name:req.body.name,
		description:req.body.description,
		members: req.body.members
	});

	roleModel.save(function(err){
		if(!err){
			User.update( { '_id' : {'$in':req.body.members}}, { 'simpleRole': roleModel._id }, {multi: true},
				
				function(err){
					if(!err){
						console.log('Save new simple role !!');
						res.end('Save success');
					}else{
						console.log(err);
						res.end('failed');
					}
			});		
		}
		else{
			console.log(err);
			res.end('failed');
		}
	});
});
router.get('/:id/edit',function(req,res){
	var baseUrl = req.protocol + '://' + req.get('host');
	request(baseUrl + '/api/users?fields=_id',function(error,response,body){
		var json;
		json = JSON.parse(body);

		roleManagementModel.findOne({"_id" : req.params.id},function(err,result){

			var members = [];
			for( var i = 0; i < result.members.length; i++){
				
				var index = -1;

				for( var j = 0; j < json.length; j++ ){
					if(json[j]._id === result.members[i] ){
						index = j;
						break;
					}
				}
				var getList = json.splice(index,1);
				if( getList.length === 1)
					members.push( getList[0] );
			}
			console.log(members);
			res.render( 'wf/roles/editRole.hbs',{ 
				layout:'homePage',
				title: 'Edit role',
				roleName: result.name,
				roleDescription: result.description,
				members: JSON.stringify(members),
				users: JSON.stringify(json)
			});
		});
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