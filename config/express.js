var express = require('express');
var morgan = require('morgan');

//var Log = require('mongoose').model('Log');

module.exports = function(){
	var app = express();

	app.set('port', (process.env.PORT || 5000));
	/*app.set('views', './app/views');
	app.set('view engine', 'jade');

	app.use(compression());
	app.use(express.static('./public'));

	if(process.env.NODE_ENV === 'development'){
		app.use(morgan('dev'));
	} else{
		app.use(morgan('common', { 
			stream: {
				write: function(msg){
					console.log(msg);
					var log = new Log({ message : msg});
					log.save( function(err){} );
				}
			}
		}));
	}

	require('../app/routes/index.routes')(app);
	require('../app/routes/dish.routes')(app);
	require('../app/routes/restaurant.routes')(app);
	require('../app/routes/error.routes')(app);*/
	
	return app;
};