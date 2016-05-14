module.exports = function(app){

	app.get('/', function(req, res){
    	res.render('index.ejs', { message: req.flash('loginMessage') }); 
  	});

  	app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: 'signupMessage' });
    });

}