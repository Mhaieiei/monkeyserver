module.exports = function(database) {

  var rootpath = require('rootpath')();

  var express = require('express');
  var path = require('path'); //path 
  var	fs = require('fs'); //file
  var busboy = require('connect-busboy');
  //var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');

  //Add new
  var passport = require('passport');
  var flash = require('connect-flash');
  var morgan = require('morgan');
  var session = require('express-session');
  var exphbs = require('express3-handlebars');  //handle bars

  var db = require('lib/dbclient');
  db.set(database);

  require('./config/passport')(passport); // pass passport for configuration
  //var routes = require('./routes/index');
  //var users = require('./routes/users');





  var app = express();
  //app.set('port',3000);
  // view engine setup

  app.set('views', path.join(__dirname, 'views'));
  //app.engine('handlebars', exphbs( {defaultLayout: 'main'} ) );
  app.engine('hbs', exphbs({extname:'hbs', defaultLayout:'main.hbs'}));
  app.set('view engine', 'hbs');//set up hbs for templating

  // set up our express application
  //app.use(session({secret:'mhai_fat'}));
  app.use(morgan('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)

  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(busboy());
  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));

  // required for passport
  app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  app.use('/download', require('./routes/download/download'));
  require('./routes/direct.js')(app, passport);
  //app.use('/', routes);
  //app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error_dev', {
        layout: 'profilePage',
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      layout: 'profilePage',
      message: err.message,
      error: {}
    });
  });

  app.set('port', process.env.PORT || 5000);

  return app;
}

