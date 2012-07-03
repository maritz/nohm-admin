var app = require('express').createServer();
var auth = require(__dirname+'/../helpers/auth');
var async = require('async');

function ModelError(msg, code){
  this.name = 'ModelError';
  if (typeof(msg) === 'string') {
    this.message = msg;
  } else {
    this.data = msg;
    this.message = 'custom';
  }
  this.code = code || 500;
  Error.call(this, msg);
}

ModelError.prototype.__proto__ = Error.prototype;


app.get('/list', auth.isLoggedIn, auth.may('list', 'Model'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  db.keys(prefix+':idsets:*', function (err, keys) {
    if (err) {
      next(new ModelError(err));
    } else {
      var modelNames = keys.map(function (key) {
        var last_colon = key.lastIndexOf(':');
        return key.substr(last_colon+1);
      });
      res.ok({
        collection: modelNames.sort()
      });
    }
  });
});


app.get('/details/:modelname', auth.isLoggedIn, auth.may('view', 'Model'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  
  async.parallel({
    properties: function (done) {
      db.get(prefix+':meta:properties:'+modelName, function (err, props) {
        if (err) {
          done(err);
        } else {
          done(null, JSON.parse(props));
        }
      });
    },
    idGenerator: function (done) {
      db.get(prefix+':meta:idGenerator:'+modelName, done);
    },
    version: function (done) {
      db.get(prefix+':meta:version:'+modelName, done);
    }
  }, function (err, result) {
    if (err) {
      next(new ModelError(err));
    } else {
      res.ok(result);
    }
  });
});


app.mounted(function (){
  console.log('mounted Model REST controller');
});

module.exports = app;