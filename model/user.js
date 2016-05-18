// app/models/user.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({

	_id : String,
    simpleRole: String,
	local: {
		title: String,
        ID : String,
        name: String, //eg.Mhai
        surname: String,
        username:String, //s50090...
        password: String,
        gender: String,
        dateOfBirth: String,
        yearattend : Number,
        bankAccount : String,
        email: String,
        role: String,   //staff,student,external 
        careerOrHigherStudying: String, //for external user
        graduatedIn: Number,            //for external user
        program: String,
        faculty: String,
        status: String,
        yeargrade : String,
        salary: Number,
        yearOfTeaching:Number,
        //jobDescription: [String],
        nationality: String, //for student - thai, national,
        age: Number,
        terminationYear:Number //academicYear of termination //only for some staff who want to terminate herself
       },
    detail:[{

       	status : String,  //drop out, on-time graduation, carry on, delayed graduaion
       	academicYear:String,
        careerOrHigherStudying:String

       }],
	roleOfProgram: [{type: String,ref:'roleOfProgram'}],
	roleOfStaff: [{type: String,ref:'roleOfStaff'}],
    subjects : [{type: mongoose.Schema.Types.ObjectId,ref:'Subject'}],
    education: mongoose.Schema.Types.Mixed,
    advisingProject : [{type: mongoose.Schema.Types.ObjectId,ref:'Project'}],
    publicResearch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Public' }],
    training: [{ type: mongoose.Schema.Types.ObjectId, ref: 'training' }],
    careerDevelopment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'careerDevelopment' }],
    specialTitle: [{ type: String, ref: 'specialTitle' }]
    

},{strict : false});


// methods ======================
// generating a has


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.changePassword = function(request,response){
    var oldpassword = request.body.oldpass;
    var newpassword = request.body.newpass;
    console.log('change password function')
    console.log('oldpassword'+ oldpassword)
    console.log('newpassword'+ newpassword)
    if(bcrypt.compareSync(oldpassword,this.local.password)){
        console.log('password match')
        this.local.password = bcrypt.hashSync(newpassword,bcrypt.genSaltSync(8),null);
        this.save(function (err,user) {
        if(err) {
            console.error('ERROR!');
        }
        else{
            response.redirect('/');
        }
        
    });
        
    }else{
         //request.flash('Old password is not math,try again')
         response.redirect('/changpass?messages='+"Old password is not match,try again");
    }
};

userSchema.methods.updateUser = function(request, response){
	console.log("User Update user");
	console.log(request.user);
	var roletype = request.body.role;

    var date = request.body.month+"/"+request.body.day+"/"+request.body.year
    var age = getAge(date);
    console.error('age: '+age);
	this.local.title = request.body.title;
	this.local.ID = request.body.ID;
	this.local.name = request.body.name;
	this.local.surname = request.body.surname;
	this.local.username = request.body.username;
	this.local.password = request.body.password;
	this.local.gender = request.body.gender;
    this.local.age = age;
	this.local.dateOfBirth = date;
	this.local.yearattend = request.body.yearattend;
	this.local.bankAccount = request.body.bankAccount;
	this.local.email = request.body.email;
	this.local.program = request.body.program;
	this.local.faculty = request.body.faculty;
    this.local.nationality = request.body.nationality;
	if( roletype == "student"){
		this.local.status = request.body.status;
		this.local.yeargrade = request.body.yeargrade;
	}
	else{
		this.local.salary = request.body.salary;
		this.local.academic_position = request.body.academic_position;
		this.local.admin_position = request.body.admin_position;
        this.local.terminationYear = request.body.terminationYear;
        this.local.yearOfTeaching = request.body.yearOfTeaching;
	}	
	
	this.save(function (err,user) {
        if(err) {
            console.error('ERROR!');
        }
        else{
        	console.log("edit already"+user)
        }
		
    });
	if(request.user.username == request.body.username){
		response.redirect('/profile_inf');
	}
	else{
		response.redirect('/profile_inf_admin?user='+request.body.username);
	}

	
};

function getAge(dateString) 
{
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}


module.exports = db.model('User', userSchema, 'users');
