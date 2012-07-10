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
      async.map(keys, function (key, cb) {
        var parts = key.split(':');
        var related_model = parts[4];
        var relation_name = parts[3];
        
        db.smembers(key, function (err, ids) {
          cb(err, {
            related_model: related_model,
            relation_name: relation_name,
            ids: ids
          });
        });
      }, done);
    }
  ], function (err, result) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok({
        relations: result
      });
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
      var is_indexed = props[property].index;
      var is_unique = props[property].unique;
      if ( ! props.hasOwnProperty(property)) {
        done('Invalid property in search parameters: '+property, null);
      } else if ( ! is_indexed && ! is_unique) {
        done('Property in search parameters is not indexed or unique: '+property, null);
      } else {
        if (is_unique) {
          db.get(prefix+':uniques:'+modelName+':'+value, done);
        } else {
          db.smembers(prefix+':index:'+modelName+':'+property+':'+value, done);
        }
      }
    }
  ], function (err, result) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok({
        ids: result
      });
    }
  });
});


app.mounted(function (){
  console.log('mounted Instance REST controller');
});

module.exports = app;