var config = require('./config');
var mongoose = require('mongoose');

module.exports = function(){
	mongoose.set('debug', config.debug);
	mongoose.connect(config.mongoUri);

	//require('../app/models/log.model');
	//require('../app/models/restaurant.model');
}