var Ni = require('ni'),
    nohm = require('nohm').Nohm,
    redis = false;

var modelCache = {},
getMeta = function getMeta (model, forceRefresh, callback) {
  if (typeof(forceRefresh) === 'function') {
    callback = forceRefresh;
    forceRefresh = false;
  }
  var refreshCache = forceRefresh || modelCache === {} || ! modelCache.hasOwnProperty(model);
    
  if (refreshCache) {
    console.log('re-retrieving meta cache.');
    if (!redis)
      redis = Ni.config('nohmclient');
      
    redis.keys(Ni.config('redis_prefix') + ':meta:*', function (err, keys) {
      if (! err && Array.isArray(keys) && keys.length > 0) {
        keys.forEach(function (value, i) {
          value = value.toString();
          var modelname = value.replace(/^[^:]*:meta:/, '');
          redis.hgetall(value, function (err, vals) {
            modelCache[modelname] = {};
            if (vals !== null) {
              for (var val in vals) {
                if (vals.hasOwnProperty(val)) {
                  modelCache[modelname][val] = JSON.parse(vals[val]);
                }
              }
            }
            if (modelname === model) {
              callback(modelCache[modelname]);
            } else {
              callback(true);
            }
          });
        });
        
      } else {
        if (err)
          console.dir(err);
        callback(false);
      }
    });
  } else {
    callback(modelCache[model]);
  }
};
getMeta(false, true, function () {});

var getChildren = function (model, id, callback) {
  redis.keys(Ni.config('redis_prefix') + ':relations:' + model + '*:' + id, function (err, keys) {
    var children = [],
    count = keys ? keys.length : 0;
    if (keys !== []) {
      keys.forEach(function (key) {
        key = key.toString();
        var relName = key.replace(/^.*:([^:]*):[^:]*:[\d]$/, '$1'),
        modelName = key.replace(/^.*:([^:]*):[\d]$/, '$1');
        redis.smembers(Ni.config('redis_prefix') + ':relations:' + model
          + ':' + relName + ':' + modelName + ':' + id, function (err, members) {
          var ids = [];
          if (members) {
            members.forEach(function (id) {
              ids.push(+id);
            });
          }
          children.push({
            model: modelName,
            rel: relName,
            ids: ids
          });
          count--;
          if (count === 0) {
            callback(children);
          }
        });
      });
    } else {
      callback([]);
    }
  });
};

module.exports = {
  __init: function (cb, req, res, next) {
    if (typeof(req.session.logged_in) === 'undefined' || !req.session.logged_in) {
      res.Ni.action = 'login';
      res.Ni.controller = 'User';
      Ni.controllers.User.login(req, res, next);
    } else {
      cb();
    }
  },
  
  index: function (req, res, next) {
    redis.keys(Ni.config('redis_prefix') + ':idsets:*', function (err, replies) {
      res.rlocals.models = [];
      if (replies) {
        replies.forEach(function (val, i) {
           res.rlocals.models[i] = val.toString().replace(/^.*\:idsets:/, '');
        });
      }
      next();
    });
  },
  
  details: function (req, res, next, model) {
    getMeta(model, function (meta) {
      if (!model) {
        console.dir('someone tried to access an inexistant model:' + model);
        return res.redirect('/Models');
      }
      
      res.rlocals.model = model;
      res.rlocals.props = meta;
      redis.smembers(Ni.config('redis_prefix') + ':idsets:' + model, function (err, replies) {
        if (err) {
          console.dir('something went wrong in fetching model details with model:' + model);
          return res.redirect('/Models');
        }
        res.rlocals.ids = replies !== null ? replies : [];
        next();
      });
    });
  },
  
  getObject: function (req, res, next, model, id) {
    if (!model || !id) {
      console.dir('someone tried to access model: "' + model + '" with id #' + id);
      res.redirect('/Models');
    }
    redis.hgetall(Ni.config('redis_prefix') + ':hash:' + model + ':' + id, function (err, replies) {
      if (err) {
        console.dir('someone tried to access an inexistant object of model: "' + model + '" with id #' + id);
        return res.redirect('/Models');
      }
      res.rlocals.model = model;
      res.rlocals.id = id;
      res.rlocals.vals = [];
      if (replies !== null) {
        res.rlocals.vals = replies;
        next();
      }
    });
  },
  
  getRelations: function (req, res, next, model, id) {
    if (!model || !id) {
      console.dir('someone tried to access model relations of: "' + model + '" with id #' + id);
      return res.redirect('/Models');
    }
    getChildren(model, id, function (children) {
      res.rlocals.relations = children;
      next();
    });
  }
};