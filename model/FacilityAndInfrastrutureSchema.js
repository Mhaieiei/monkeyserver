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

lecturerPlaceSchema.methods.editFacility = function(request, response){
    console.log("Edit facility place");
    this.roomNo = request.body.roomno;
    this.floor = request.body.floor;
    this.building = request.body.building;
    this.numberOfSeat = request.body.noofseat;
    this.programAndAcYear = request.body.acid    
    
     
    this.save(function (err) {
        if(err) {
            console.error('Cant update new facility');
        }
        
    });
     
    response.redirect('/aun/aun10-1?acid='+request.body.acid+'&programn='+request.body.program+'&year='+request.body.year);
};
module.exports = db.model('lecturerPlaceSchema', lecturerPlaceSchema, 'lecturerPlaceSchema');
