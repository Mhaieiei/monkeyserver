var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var assesmentToolSchema = mongoose.Schema({

    
    assesmentTool: String,
    type: String,
    programname:String,
    subject: [{

        subjectType: String,
        followingReq:String

    }]

});

module.exports = assesmentToolSchema// JavaScript source code
