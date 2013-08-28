var app = require('express').createServer();
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


app.get('/list/:modelname', function (req, res, next) {
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


app.get('/properties/:modelname/:id', function (req, res, next) {
  var db = req.getDb();
  var prefix = req.getPrefix();

  var modelName = req.param('modelname');
  var id = req.param('id');

  async.auto({
    hash: function (callback) {
      db.hgetall(prefix+':hash:'+modelName+':'+id, callback);
    },
    properties: function (callback) {
      db.get(prefix+':meta:properties:'+modelName, callback);
    },
    indexChecked: ['hash', 'properties', function (callback, results) {
      if ( ! results.hash) {
        return callback();
      }
      var props = JSON.parse(results.properties);
      var indexes = [];
      var uniques = [];
      async.forEach(Object.keys(props), function (name, next) {
        if (props[name].index) {
          db.sismember(prefix+':index:'+modelName+':'+name+':'+results.hash[name], id, function (err, is_indexed) {
            if ( ! is_indexed) {
              indexes.push(name);
            }
            next(err);
          });
        } else if (props[name].unique && results.hash[name]) {
          db.get(prefix+':uniques:'+modelName+':'+name+':'+results.hash[name], function (err, unique_id) {
            if (id !== unique_id) {
              uniques.push(name);
            }
            next(err);
          });
        } else {
          next();
        }
      }, function (err) {
        callback(err, {
          index: indexes,
          unique: uniques
        });
      });
    }],
    original_model: function (callback) {
      req.getModel(modelName, callback);
    },
    typecasted: ['original_model', function (done, result) {
      new result.original_model(id, done);
    }]
  }, function (err, results) {
    if (err) {
      next(new InstanceError(err));
    } else if ( ! results.hash) {
      next(new InstanceError('not_found', 404));
    } else {
      res.ok({
        properties: results.hash,
        typecasted: results.typecasted,
        wrong_indexes: results.indexChecked
      });
    }
  });
});


app.get('/relations/:modelname/:id', function (req, res, next) {
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


app.get('/find/:modelname/:property/:value', function (req, res, next) {
  var modelName = req.param('modelname');
  var property = req.param('property');
  var value = req.param('value');

  async.waterfall([
    async.apply(req.getModel, modelName),
    function (model, done) {
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


app.del('/:modelname/:id', function (req, res, next) {
  var modelName = req.param('modelname');
  var id = req.param('id');

  async.waterfall([
    async.apply(req.getModel, modelName),
    function (model, done) {
      model.remove(id, done);
    }
  ], function (err) {
    if (err) {
      next(new InstanceError(err));
    } else {
      res.ok();
    }
  });
});


app.put('/property/:modelname/:id', function (req, res, next) {
  var modelName = req.param('modelname');
  var id = req.param('id');
  var mode = req.param('mode');
  var property = req.param('property');
  var value = req.param('value');

  var done = function (err, error_fields) {
    if (err && err !== 'invalid') {
      next(new InstanceError(err));
    } else if (err) {
      next(new InstanceError({error: err, fields: {value: error_fields[property]}}, 400));
    } else {
      res.ok();
    }
  };

  if (mode !== 'nohm') {
    var db = req.getDb();
    var prefix = req.getPrefix();
    db.hset(prefix+':hash:'+modelName+':'+id, property, value, done);
  } else {
    var model_instance;
    async.waterfall([
      async.apply(req.getModel, modelName),
      function (Model, next) {
        model_instance = new Model(id, next);
      },
      function (props, next) {
        model_instance.p(property, value);

        // If the loaded value is the same as the input but typecasting would make it different, nohm does not recognize the update to the property.
        // Thus we have to manually trigger it. This is an ugly hack, that under normal circumstances shouldn't be neccessary (because the value from the db should not have been in that form in the first place)
        // Example:
        // We have a property that is typecasted to integer, but from the database we receive a non-integer value. (database corruption or model definition changed without changing the dataset)
        // Typecasting now casts the loaded value to 0.
        // If the input value is invalid as well or 0, no update is triggered, thus the old non-integer value stays in the database.
        // (which under normal circumstances isn't much of a problem either but here we want to explicitly overwrite it.)
        //
        // This sadly causes unique checks to not work properly anymore... Let's just ignore that! YEEEY
        // TODO: fix that shit, you lazy fucker.
        model_instance.properties[property].__updated = true;

        model_instance.save(function (err) {
          next(err, model_instance.errors);
        });
      }
    ], done);
  }
});


app.mounted(function (){
  console.log('mounted Instance REST controller');
});

module.exports = app;