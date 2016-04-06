// JavaScript source code
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var roleSchema = mongoose.Schema({
    acyear: String,
    _type: String
});

var roleOfProgramSchema = mongoose.Schema({


    "type": String,//development  committee
    "academicYear": String,
    "position": String,//chairman...
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]


});

var roleOfStaffSchema = mongoose.Schema({


    "type": String,//academic , support staff, student
    "academicYear": String,
    "position": String,//faculty member,visiting member, accountance, normal master student
    "program": String,
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    "jobDescription":[String],
    "timeOfWork":String

});


var specialTitleSchema = mongoose.Schema({

    "title": String,
    "type": String, //academic title for academic staff, advancementOfCareer for supporting staff 
    "academicYear": String,
    "program": String,
    "role":String, // Faculty Member,Visiting Member, Supporting Staff
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]


});



var role = db.model('role', roleSchema, 'role');
role.roleOfProgram = db.model('roleOfProgram', roleOfProgramSchema, 'role');
role.roleOfStaff = db.model('roleOfStaff', roleOfStaffSchema, 'role');
role.specialTitle = db.model('specialTitle', specialTitleSchema, 'role');

module.exports = role;