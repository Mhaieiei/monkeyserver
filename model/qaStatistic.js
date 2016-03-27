// JavaScript source code
// app/models/faculty.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our faculty model
var qaStatisticSchema = mongoose.Schema({
    // save qaStateSchema first then User enter score or result and save then the program will save the result in db then program check type whether AUN of TQF then assign att of that indicator by obj id ($set)
    programAndAcYear: { type: mongoose.Schema.Types.ObjectId, ref: 'Acyear' },
    title: String, //AUN1.1,AUN1,TQF2.5...
    description: String,
    type:String, //aun,tqf
    //overall: [{ type: mongoose.Schema.Types.ObjectId, ref: 'overall' }],
    //aun: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AUN' }],
    //tqf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TQF' }]
});

//var overAllSchema = mongoose.Schema({
//    aun: String, //AUN 1,2,3,4,5,6,7,8,..15
//    score: Number
//});

var tqfSchema = mongoose.Schema({
    isPassed:Boolean,
    conponent: String,
    criteria: String,
    detail: [{
        indicator: String,
        supportDocument: [String]
    }]
});

var aunSchema = mongoose.Schema({
    score: Number
});

var qaStatistic = mongoose.model('QaStatistic', qaStatisticSchema, 'qaStatistic');
module.exports = qaStatistic;

qaStatistic.aun = mongoose.model('AUN', aunSchema, 'qaStatistic');
qaStatistic.tqf = mongoose.model('TQF', tqfSchema, 'qaStatistic');