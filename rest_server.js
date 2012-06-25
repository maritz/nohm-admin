var file_helper = require('./helpers/file.js');
var express = require('express');
var server = express.createServer();
var nohm = require('nohm').Nohm;
var registry = require(__dirname+'/registry.js');
var RedisSessionStore = require('connect-redis')(express);

module.exports = server;

server.use(express.logger({ format: 'dev' }));
server.use(express.responseTime());
server.use(express.bodyParser());
server.use(express.methodOverride());
server.use(express.cookieParser());
server.use(express.session({
  store: new RedisSessionStore({
    client: registry.redis_sessions
  }),
  secret: registry.config.sessions.secret
}));

server.use(express.csrf());

server.use(function (req, res, next) {
  res.ok = function (data, meta) {
    data = data || {};
    res.json({result: 'success', data: data, meta: meta});
  };
  
  //console.log(req.method, req.url);
  req.loaded = {};
  req.user = nohm.factory('User');
  if ( req.session.userdata && ! isNaN(req.session.userdata.id)) {
    req.user.load(req.session.userdata.id, function (err) {
      if (err) {
        req.session.logged_in = false;
        req.session.userdata = undefined;
      }
      next();
    });
  } else {
    next();
  }
});

// functions to get the selected database and nohm prefix
server.use(function (req, res, next) {
  req.getDb = function() {
    var selection = req.session.selected_db;
    var db = registry.selected_dbs[selection];
    if ( ! db) {
      db = registry.selected_dbs[registry.redis.host+':'+registry.redis.port];
      req.db_defaulted = true;
    }
    return db.client;
  }
  
  req.getPrefix = function () {
    return req.session.nohm_prefix || registry.config.nohm.prefix;
  }
  
  var _ok = res.ok;
  res.ok = function (obj) {
    var client = req.getDb();
    var meta = {
      db: {
        client: client.host,
        port: client.port,
        database: client.selected_db,
        prefix: req.getPrefix(),
        defaulted: !! req.db_defaulted
      }
    };
    _ok(obj, meta);
  };
  next();
});

  
var controller_files = file_helper.getFiles(__dirname, '/controllers/');

controller_files.forEach(function (val) {
  var name = val.match(/^\/controllers\/([\w]*)Controller.js$/)[1];
  
  server.use('/'+name, require(__dirname+val));
});

server.all('*', function (req, res, next) {
  var notFoundError = new Error('Resource not available with given METHOD and URL.');
  console.log(req.method, req.url);
  notFoundError.code = 404;
  next(notFoundError);
});

server.use(function (err, req, res, next) {
  if (err && err instanceof Error) {
    console.log('responding with error: '+err.name);
    console.dir(err.message);
    var code = err.code || 500;
    var data = err.data || {error: {name: err.name, msg: err.message}};
    res.json({result: 'error', data: data}, code);
    if (['ReferenceError', 'TypeError', 'SyntaxError'].indexOf(err.name) >= 0) {
      console.log(err.stack);
    }
  } else {
    console.log('uncaught error');
    console.dir(err);
    next(err);
  }
});

server.mounted(function (parent){
  console.log('mounted REST server');
});
