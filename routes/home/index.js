 var router = require('express').Router();
 var Doc = require('../../model/document/document');
 var isLoggedIn = require('../../middleware/loginChecker');
 var request = require('request');

// =====================================
// HOME SECTION =====================
// =====================================
router.get('/', isLoggedIn, function(req, res) {
  var query = Doc.findByUser(req.user);
  query.exec(function(err,_docs) {
    if(err)
      return handleError(req, res);

    getWorkflowTaskList(req, function(taskList) {
      var response = dateDDMMYYYY(_docs);
      response.result = taskList;
      res.render('home.hbs', response);
    })
  });
});


router.post('/', isLoggedIn, function(req, res) {
  console.log('AT HOME');
  var date= [];
  var documentName = req.body.doc_name;
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
  where('name').regex(subStringRegex(documentName, false));

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

  console.log("Status:"+status);

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
      docName: documentName,
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

    res.render('home.hbs', response); 
  });
});

 function handleError(res, next) {
  console.error(err);
  res.status(500);
  return next(err);
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
  //get workflow list 
  request(baseUrl + '/api/workflow/workflowexecutions',function(error1,response1,body1){
    //get task workflow list
    request(baseUrl + '/api/workflow/tasks',function(error2,response2,body2){ 
      var json = JSON.parse(body2);
      console.log(body2);
      console.log(body1);
      console.log(typeof json);
      callBackWithResult(json);
    });
  });
}

module.exports = router;