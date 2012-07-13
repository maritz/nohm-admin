var app = require('express').createServer();
var auth = require(__dirname+'/../helpers/auth');
var async = require('async');
var cp = require('child_process');

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
        collection: ids.map(function (id) {
          return {id: id};
        })
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
    } else if ( ! properties) {
      next(new InstanceError('not_found', 404));
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
  
  async.waterfall([
    function (done) {
      db.smembers(prefix+':relationKeys:'+modelName+':'+id, done);
    },
    function (keys, done) {
      var relations = {};
      async.forEach(keys, function (key, cb) {
        var parts = key.split(':');
        var related_model = parts[4];
        var relation_name = parts[3];
        
        db.smembers(key, function (err, ids) {
          if (err) {
            cb(err);
          } else {
            if ( ! relations.hasOwnProperty(related_model)) {
              relations[related_model] = {};
            }
            relations[related_model][relation_name] = ids;
            cb(null);
          }
        });
      }, function (err) {
        done(err, relations);
      });
    }
  ], function (err, result) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok(result);
    }
  });
});


app.get('/find/:modelname/:property/:value', auth.isLoggedIn, auth.may('list', 'Instance'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  var property = req.param('property');
  var value = req.param('value');
  
  async.waterfall([
    function (done) {
      db.get(prefix+':meta:properties:'+modelName, done);
    },
    function (property_string, done) {
      var props = JSON.parse(property_string);
      var model = require('nohm').Nohm.model(modelName, {
        properties: props,
        client: req.getDb()
      }, true);
      var search = {};
      search[property] = value;
      model.find(search, done);
    }
  ], function (err, result) {
    if (err) {
      next(new InstanceError(err));
    } else {
      if ( ! Array.isArray(result)) {
        if (result === null) {
          result = [];
        } else {
          result = [result];
        }
      }
      res.ok({
        requested: value,
        collection: result.map(function (id) {
          return {id: id};
        })
      });
    }
  });
});


app.get('/remove/:modelname/:id', auth.isLoggedIn, auth.may('list', 'Instance'), function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();
  
  var modelName = req.param('modelname');
  var id = req.param('id');
  
  async.waterfall([
    function (done) {
      db.get(prefix+':meta:properties:'+modelName, done);
    },
    function (property_string, done) {
      var props = JSON.parse(property_string);
      var model = require('nohm').Nohm.model(modelName, {
        properties: props,
        client: req.getDb()
      }, true);
      
      model.remove(id, done);
    }
  ], function (err, result) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok();
    }
  });
});


app.mounted(function (){
  console.log('mounted Instance REST controller');
});

module.exports = app;