var mongoose = require('mongoose');

module.exports = function(){
	mongoose.set('debug', true);
	mongoose.connect('mongodb://monkeyadmin:AdminOffice123@ds031203.mlab.com:31203/monkeyoffice');
	require('../model/user');
}