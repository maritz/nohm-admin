var app = require('express').createServer();
var auth = require(__dirname+'/../helpers/auth');
var nohm = require('nohm').Nohm;
var async = require('async');

function InstanceError(msg, code){
  this.name = 'InstanceError';
  if (typeof(msg) === 'string') {
    this.message = msg;
  } else {
    this.data = msg;
    this.message = 'custom';
  }
  this.code = code || 500;
  Error.call(this, msg);
}

InstanceError.prototype.__proto__ = Error.prototype;


app.get('/list/:modelname', auth.isLoggedIn, auth.may('list', 'Instance'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  
  db.smembers(prefix+':idsets:'+modelName, function (err, ids) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok({
        total: ids.length,
        collection: ids
      });
    }
  });
});


app.get('/properties/:modelname/:id', auth.isLoggedIn, auth.may('view', 'Instance'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  var id = req.param('id');
  
  db.hgetall(prefix+':hash:'+modelName+':'+id, function (err, properties) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok({
        properties: properties
      });
    }
  });
});


app.get('/relations/:modelname/:id', auth.isLoggedIn, auth.may('view', 'Instance'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  var id = req.param('id');
  
  db.hgetall(prefix+':hash:'+modelName+':'+id, function (err, properties) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok({
        properties: properties
      });
    }
  });
});


app.mounted(function (){
  console.log('mounted Model REST controller');
});

module.exports = app;