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
  var session = require('express-session');
  var exphbs = require('express3-handlebars');  //handle bars

  var db = require('lib/dbclient');
  db.set(database);

  require('./config/passport')(passport); // pass passport for configuration
  //var routes = require('./routes/index');
  //var users = require('./routes/users');

  //for uploading file
  var methodOverride = require('method-override');

  global.__APPROOT__ = path.resolve(__dirname);

  var app = express();
  //app.set('port',3000);
  // view engine setup

  hbs = exphbs.create({
    extname:'hbs', 
    defaultLayout:'main.hbs',
    helpers: {
      selectOptionWorkflow: function(value){
        var options = [ 
          { 
            value: 'all',
            show: 'All'
          }, 
          {
            value: 'in_progress',
            show: 'In progress'
          }, 
          {
            value: 'done',
            show: 'Done'
          }
        ];
        var html = '';

        for( var i = 0; i < options.length; i++ ){
          var selected = '';
          
          if( value === options[i].value )
            selected = 'selected';

          html += '<option value="' + options[i].value + '" '+ selected + '>' + options[i].show + '</option>';
        }

        return html;
      }
    }
  });

  app.set('views', path.join(__dirname, 'views'));
  //app.engine('handlebars', exphbs( {defaultLayout: 'main'} ) );
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');//set up hbs for templating

  // set up our express application
  //app.use(session({secret:'mhai_fat'}));
  app.use(logger('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  //use for upload
  app.use(methodOverride()); 


  app.use(busboy());
  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));

  // required for passport
  app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  require('./routes/main')(app, passport);
  app.use('/api', require('./routes/api'));
  app.use('/some', require('./routes/wf/some'));
  
  app.use(function(req, res, next){
     if (req.isAuthenticated())
        return next();
    res.redirect('/');
  });
  app.use('/home', require('./routes/home'));
  app.use('/uploads', require('./routes/download/download'));
  app.use('/api', require('./routes/api'));
  app.use('/document', require('./routes/document'))
  require('./routes/direct.js')(app, passport);
  //app.use('/', routes);
  //app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('PAGE NOT FOUND');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log(err);
      res.status(err.status || 500);
      res.render('error_dev', {
        layout: 'homePage',
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      layout: 'homePage',
      message: err.message,
      error: {}
    });
  });

  app.set('port', process.env.PORT || 5000);

  return app;
}

