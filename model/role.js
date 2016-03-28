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


    "type": String,//academic , support staff
    "academicYear": String,
    "position": String,//lecturer, accountance
    "program": String,
    //"academicTitle":String, //for academic staff
    //"advancementOfCareer":String, //for supporting staff
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    "roleOfFaculty": { type: mongoose.Schema.Types.ObjectId, ref: 'roleOfFaculty' }

});

var roleOfFacultySchema = mongoose.Schema({ 

    "roleOfStaff": [{ type: mongoose.Schema.Types.ObjectId, ref: 'roleOfStaff' }], //only academic staff
    "type": String,
    "academicYear": String,
    "program":String,
    "TimeOfWork": String,
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]


});

var specialTitleSchema = mongoose.Schema({

    "title": String,
    "type": String, //academic title for academic staff, advancementOfCareer for supporting staff 
    "academicYear": String,
    "program": String,
    
    "user": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]


});



var role = db.model('role', roleSchema, 'role');
role.roleOfProgram = db.model('roleOfProgram', roleOfProgramSchema, 'role');
role.roleOfFaculty = db.model('roleOfFaculty', roleOfFacultySchema, 'role');
role.roleOfStaff = db.model('roleOfStaff', roleOfStaffSchema, 'role');
role.specialTitle = db.model('specialTitle', specialTitleSchema, 'role');

module.exports = role;