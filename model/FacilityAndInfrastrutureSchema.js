var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var lecturerPlaceSchema = mongoose.Schema({

    roomNo: String,
    floor: Number,
    building: String,
    numberOfSeat: Number,
    programAndAcYear: String,

});

module.exports = db.model('lecturerPlaceSchema', lecturerPlaceSchema, 'lecturerPlaceSchema');
