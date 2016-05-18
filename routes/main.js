module.exports = function(app, passport){

	app.get('/', function(req, res){
      if (req.isAuthenticated())
        res.redirect('/home');
      else
    	   res.render('index.ejs', { message: req.flash('loginMessage') }); 
  	});

  	app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
  

  	app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: 'signupMessage' });
    });

     app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

}