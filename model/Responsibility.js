// JavaScript source code
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var Responsibility = mongoose.Schema({
    category: String,
    description: String,
    ELO: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ELO' }]
     //in case, edit program topic
    
});

module.exports = db.model('Responsibility', Responsibility);


