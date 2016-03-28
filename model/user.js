// app/models/user.js
// load the things we need
var db = require('../lib/dbclient').db();
var mongoose = require('mongoose');

var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({

	_id : String,
	local: {
		title: String,
        ID : String,
        name: String, //eg.Mhai
        surname: String,
        username:String, //s50090...
        password: String,
        gender: String,
        dateOfBirth: Date,
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
        jobDescription: [String],
        nationality: String, //for student - thai, national,
        age: Number,
        terminationYear:Number //academicYear of termination //only for some staff who want to terminate herself
       },
	roleOfProgram: [String],
	roleOfStaff: [String],
    subjects : [{type: mongoose.Schema.Types.ObjectId,ref:'Subject'}],
    education: mongoose.Schema.Types.Mixed,
    advisingProject : [{type: mongoose.Schema.Types.ObjectId,ref:'Project'}],
    publicResearch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Public' }],
    training: [{ type: mongoose.Schema.Types.ObjectId, ref: 'training' }],
    careerDevelopment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'careerDevelopment' }],
    specialTitle: [{ type: mongoose.Schema.Types.ObjectId, ref: 'specialTitle' }]
    

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

userSchema.methods.updateUser = function(request, response){
	console.log("User Update user");
	console.log(request.user);
	var roletype = request.body.role;

	this.local.title = request.body.title;
	this.local.ID = request.body.ID;
	this.local.name = request.body.name;
	this.local.surname = request.body.surname;
	this.local.username = request.body.username;
	this.local.password = request.body.password;
	this.local.gender = request.body.gender;
	this.local.dateOfBirth = request.body.dateOfBirth;
	this.local.yearattend = request.body.yearattend;
	this.local.bankAccount = request.body.bankAccount;
	this.local.email = request.body.email;
	this.local.program = request.body.program;
	this.local.faculty = request.body.faculty;
	if( roletype == "student"){
		this.local.status = request.body.status;
		this.local.yeargrade = request.body.yeargrade;
	}
	else{
		this.local.salary = request.body.salary;
		this.local.academic_position = request.body.academic_position;
		this.local.admin_position = request.body.admin_position;
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
userSchema.methods.editEducation = function(request, response){	
	console.log("Eieiei555");	
	var index = request.query.id;
	console.log(index);
	this.education[index].level = request.body.level;
	this.education[index].degree = request.body.degree;
	this.education[index].university = request.body.university;
	this.education[index].year = request.body.year;
	 
	this.save(function (err) {
        if(err) {
            console.error('ERROR!');
        }
		
    });
	console.log("Eieiei");
	response.redirect('/education_inf');


};

module.exports = db.model('User', userSchema, 'users');
