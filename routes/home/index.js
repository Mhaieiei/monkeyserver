var router = require('express').Router();
var WorkflowExecution   = require('../../model/WorkflowExecution.model');
var WorkflowTask    = require('../../model/WorkflowTask.model');
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

  var searchStrategy = null;

  if( req.query.submit_type === 'workflow'){
    searchStrategy = 'wf';
  } else if( req.query.submit_type === 'document'){
    searchStrategy = 'doc';
  }

  console.log( req.query );


  var query = Doc.findByUser(req.user);
  if( req.user.local.role == 'admin'){
     adminfact = true;
  }else{
     adminfact = null;
  }

  var response = {layout: 'homePage'};
  response.username = req.user.local.username;
  
  async.parallel([findMyDocument(), findMyWorkflow(), findTask(), findSharedDocument()], function(error) {
    if(error) next(error);

    response.admin = adminfact;
    response = JSON.parse(JSON.stringify(response));
    res.render('home.hbs', response);
  })

  function findMyDocument() {
    return function(done) {

      if( searchStrategy === 'doc' ){
        var query = Doc.findByUser(req.user);

        // search by name
        if(req.query.doc_name)
          query.find( { "name": { "$regex": req.query.doc_name, "$options": "i" } } );

        // search by author
        if(req.query.doc_author)
          query.find( { "author": req.query.doc_author } );

        query
        .populate('visibility')
        .exec(function(error, _docs) {
          if(error) return done(error);
          response.doc = JSON.parse(JSON.stringify(_docs));
          done();
        });

      }else{
        Doc.findByUser(req.user)
        .populate('visibility')
        .exec(function(error, _docs) {
          if(error) return done(error);
          response.doc = JSON.parse(JSON.stringify(_docs));
          done();
        });
      } 
    }
  }

  function findMyWorkflow() {
    return function(done) {

      if( searchStrategy === 'wf' ){

        // Search from my workflow executions only.
        var query = WorkflowExecution.find({ executorId: req.user._id });

        // search name with substring
        query.find( { "templateName": { "$regex": req.query.wf_name, "$options": "i" } } );

        // search by status
        var status = -1;
        if( req.query.wf_status === 'in_progress'){
          status = 0;
        } else if( req.query.wf_status === 'done' ){
          status = 1;
        }

        if( status >= 0 ){
          query.find( { "status": status } );
        }

        // search by execution date
        var fromDate = Date.parse(req.query.from_date);
        var toDate = Date.parse(req.query.to_date);

        if(!isNaN(fromDate) && !isNaN(toDate)) {
          console.log("DAAAAAAEEEE");
          fromDate = new Date(fromDate);
          toDate = new Date(toDate);
          query = query.where('createDate').gte(fromDate).lte(toDate);
          console.log(fromDate);
        }

        var wfContent = req.query.wf_content;
        response.wfName = req.query.wf_name;
        response.wfContent = req.query.wf_content;
        response.wfStatus = req.query.wf_status;

        query.exec(function(err, result){

          if( wfContent == '' ){
            response.exec = result;

          } else{
            var selectedResults = [];
            loop1:
            for( var i = 0; i < result.length; i++ ){
              var elements = Object.keys( result[i].details );
              loop2:
              for( var j = 0; j < elements.length; j++ ){
                
                var currentElement = result[i].details[ elements[j] ];
                
                if( currentElement !== undefined && currentElement.submitResults !== undefined ){
                  var submitResults = currentElement.submitResults;
                  var submitKeys = Object.keys(submitResults);
                  loop3:
                  for( var k = 0; k < submitKeys.length; k++ ){
                    if( submitKeys[k] !== 'files' && submitKeys[k] !== 'submit' && submitKeys[k] !== 'output'){
                      
                      if( String(submitResults[submitKeys[k]]).indexOf(wfContent) > -1 ){
                        selectedResults.push( result[i] );
                        break loop2;
                      }  
                    }
                  }
                }
              }
            }

            response.exec = selectedResults;
          }
          done();
        });

        // test find workflow name
        //WorkflowExecution.find({ })


      }
      else{
        var query = WorkflowExecution.find({ executorId: req.user._id });
        
        query.exec(function(err, result){
          response.exec = result;
          done();
        });
      }
    }
  }

  function findTask(){
    return function(done){
      WorkflowTask.find({})
      .exec(function(error, result) {
        if(error) done(error);
        response.task = result;
        done();
      });
    }
  }

  function findSharedDocument() {
    return function(done) {
      Doc.find({})
      .populate('visibility', null, {members: {$in: [req.user.local.username]}})
      .exec(function(error, sharedDocuments) {
        if(error) return done(error);

        sharedDocuments = sharedDocuments.filter(function(doc) {
          return doc.visibility.length;
        })

        sharedDocuments = JSON.parse(JSON.stringify(sharedDocuments));
        console.log('Shared Doc: ' + sharedDocuments);
        response.sharedDocuments = sharedDocuments;
        return done();
      })
    }
  }

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

  var query = Doc.findByUser(user).where('name').regex(subStringRegex(Name, false));

  if(!isNaN(fromDate) && !isNaN(toDate)) {
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    query = query.where('dateCreate').gt(fromDate).lt(toDate);
  }

  if(author) {
    query = Doc.findByUser(author);
  }

  if(status != null && status !== 'all') {
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
      layout: 'homePage',
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
    res.json(returnDocument)
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

function getWorkflowTaskList(req, callBackWithResult) {
  
  var execResult, taskResult;

  async.parallel([findWorkflowExecution(), findTask()], function(error) {
    if(error) console.log(error);
    callBackWithResult(execResult, taskResult);
  })

  function findWorkflowExecution() {
    return function(done) {
      WorkflowTask.find({ $or: [ {'doerId': req.user._id }, { 'roleId': req.user.simpleRole } ] })
      .exec(function(error, exec) {
        if(error) done(error);
        taskResult = exec;
        done();
      })
    }
  }

  function findTask() {
    return function(done) {
      WorkflowExecution.find({ 'executorId':  req.user._id })
      .exec(function(error, exec) {
        if(error) done(error);
        execResult = exec;
        done();
      })
    }
  }
}

module.exports = router;