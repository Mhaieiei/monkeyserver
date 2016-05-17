var router = require('express').Router();
var Doc = require('../../model/document/document');
var isLoggedIn = require('../../middleware/loginChecker');
var request = require('request');
var fs = require('fs');
var async = require('async');
var Attachment = require('../../model/document/attachment');
var adminfact = "";

// =====================================
// HOME SECTION =====================
// =====================================
router.get('/', isLoggedIn, function(req, res, next) {
  var query = Doc.findByUser(req.user);
  if( req.user.local.role == 'admin'){
     adminfact = true;
  }else{
     adminfact = null;
  }
  query.exec(function(err, _docs) {
    handleError(err, res, next);

    getWorkflowTaskList(req, function(execList,taskList) {
      var response = dateDDMMYYYY(_docs);

      response.exec = execList;
      response.task = taskList;
      response.admin = adminfact;
      console.log("response");
      console.log(response);
      res.render('home.hbs', response);

    })
  });
});


router.post('/', isLoggedIn, function(req, res) {
  console.log('AT HOME');
  

  var date= [];
  var Name = req.body.doc_name;
  var status = req.body.doc_status;
  var fromDate = Date.parse(req.body.fromDate);
  var fDate = req.body.fromDate;
  var toDate = Date.parse(req.body.toDate);
  var tDate = req.body.toDate;
  var type = req.body.doc_type;
  var author = req.body.doc_author;
  var user = req.user;

  var subStringRegex = function(subString, isCaseSensitive) {
    var mode;
    if(isCaseSensitive) mode = 'c';
    else mode = 'i';

    return new RegExp(subString, mode);
  };

  var query = Doc.findByUser(user).
  where('name').regex(subStringRegex(Name, false));

  if(!isNaN(fromDate) && !isNaN(toDate)) {
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    query = query.where('dateCreate').gt(fromDate).lt(toDate);
  }

  if(author) {
    query = Doc.findByUser(author);
  }

  if(status !== 'all') {
    status = status.toLowerCase().trim();
    query = query.where('status').equals(status);
  }


  query.exec(function(err, _docs) {
    if(err) {
      console.log(err);
      res.status(500);
      return next(err);
    }

    console.log("Type: " + type);
    var status1;
    var status2;
    var status3;
    var type1;
    var type2;

    if (status == 'create') {
      status1 = true;
    } else if (status == 'inprogress'){
      status2 = true;
    } else if (status == 'done'){
      status3 = true;
    }

    if (type == 'own'){
      type1 = true;
    } else if (type == 'other_type'){ 
      type2 = true;
    }

    console.log('s1:'+status1);
    console.log('s2:'+status2);
    console.log('s3:'+status3);
    console.log('type1:'+type1);
    console.log('type2:'+type2);

    
    var response = {
      layout: 'homepage',
      docs: _docs,
      Name: Name,
      docAuthor: author,
      docStatus: status,
      docFromDate: fDate,
      docToDate: tDate,
      docType: type,
      st1: status1,
      st2: status2,
      st3: status3,
      type1: type1,
      type2: type2,
      admin : adminfact,
      helpers: {
        getdate: function (value) { return date[value]; }
      }
    }

    for(var i = 0 ; i < response.docs.length ;++i){
      var a = response.docs[i].dateCreate;
      var yy = a.getFullYear();
      var mm = a.getMonth()+1;
      var dd = a.getDate();

      if(mm<10){
        mm = "0"+mm;
      }
      if(dd<10){
        dd = "0"+dd;
      }

      date[i] = dd+ '/' +mm +'/'+ yy;
    }

  var baseUrl = req.protocol + '://' + req.get('host');
  request(baseUrl + '/api/workflow/workflowexecutions?name=' + Name +'&status=' + status + '&author=' + author,function(error1,response1,body1){
  if( response1.statusCode === 404 ){
    return next(new Error('Invalid document id'));
  }
    request(baseUrl + '/api/workflow/tasks?name=' + Name +'&status=' + status + '&author=' + author,function(error2,response2,body2){ 
        response.task = JSON.parse(body2);
        response.exec = JSON.parse(body1);
        res.render('home.hbs', response); 
       });    
  });
    
  });
});

router.get('/upload', isLoggedIn, function(req, res){
  console.log("Uploading....");
  
  res.render('dms/getUpload.hbs',{
    layout:"homePage"
  });
});

router.post('/upload',function(req, res, next){
 writeFile(req, res, next, function(returnDocument) {
  if(req.query.json)
    res.json(document)
  else
    res.redirect('/home');
 });
});

function writeFile(req, res, next, onReturnDocument) {
  console.log('Write file');
    var path = require('path');
    var fstream;

    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {

      console.log("Uploading: " + filename); 
      var targetPath = path.join(global.__APPROOT__, 'uploads', 'document', filename);
      console.log(targetPath);

      var serverPath = 'uploads/document/';
      if(!fs.existsSync(serverPath))
        fs.mkdirSync(serverPath);

      fstream = fs.createWriteStream(targetPath);
      file.pipe(fstream);
      fstream.on('close', function() {
        console.log('Done');
        mapFileToDocument(req, res, next, filename, serverPath + filename, onReturnDocument);
      });
  })
}

function mapFileToDocument(req, res, next, filename, targetPath, onReturnDocument) {
    var owner = req.user.local.username;
    var attachment = new Attachment({owner: owner, author: owner, name: filename, filepath: targetPath});
    attachment.save(function(error) {
      handleError(error, res, next);
      onReturnDocument(attachment);
    });
}

function handleError(error, res, next) {
  if(!error)
    return;

  console.error(error);
  res.status(500);
  return next(error);  
}

function dateDDMMYYYY(documentQueryResult) {
  var date= [];
  var response = {
    layout: 'homePage',
    docs: documentQueryResult,
    helpers: {
      getdate: function (value) { return date[value]; }
    }
  }

  for(var i = 0 ; i < documentQueryResult.length ;++i){
    var a = documentQueryResult[i].dateCreate;
    var yy = a.getFullYear();
    var mm = a.getMonth()+1;
    var dd = a.getDate();

    if(mm<10){
      mm = "0"+mm;
    }
    if(dd<10){
      dd = "0"+dd;
    }

    date[i] = dd+ '/' +mm +'/'+ yy;
  }

  return response;
}

function getWorkflowTaskList(req, callBackWithResult) {
 var baseUrl = req.protocol + '://' + req.get('host');
  //get document list 
  //request(baseUrl + '/api/document/read?userid='+ req.user._id ,function(error1,response1,body1){
    //get workflow list 
    request(baseUrl + '/api/workflow/workflowexecutions',function(error2,response2,body2){
    //get task workflow list
      request(baseUrl + '/api/workflow/tasks',function(error3,response3,body3){ 
        var exec = JSON.parse(body2);
        var task = JSON.parse(body3);
        callBackWithResult(exec,task);
       });
    });
  //});
}

module.exports = router;