var express = require('express'),
    RedisStore = require('connect-redis'),
    Ni = require('ni'),
    nohm = require('nohm').Nohm,
    helpers = require(__dirname+'/helpers/general.js');
    
process.argv.forEach(function (val, index) {
  if (val === '--scss-watch') {
    require(__dirname+'/helpers/scss-watch.js');
  }
});


// load config
require('./config');

var nohmclient = require('redis').createClient(Ni.config('redis_port'), Ni.config('redis_host'));
var redisSessionStore = new RedisStore({
    magAge: 60000 * 60 * 24/*one day*/, 
    port: Ni.config('redis_port'), 
    host:Ni.config('redis_host') });

require('async').series([
    function (cb) {
      nohmclient.select(Ni.config('redis_nohm_db'), function (err) {
        if (err) {
          console.dir(err);
        }
        nohm.setClient(nohmclient);
        Ni.config('nohmclient', nohmclient);
        cb();
      });
    },
    function (cb) {
      Ni.config('root', __dirname);
      Ni.boot(cb);
    },
    function (cb) {
     redisSessionStore.client.select(Ni.config('redis_session_db'), cb);   
    }
  ], 
  function(err) {
  
    Ni.controllers.home = Ni.controllers.Database;
    
    // initialize the main app
    var app = express.createServer();
    app.set('view engine', 'jade');
    
    // static stuff
    app.use(express.favicon(''));
    app.use(express['static'](__dirname + '/public'));
    
    // start main app pre-routing stuff
    app.use(express.bodyParser());
    app.use(express.cookieParser());
      
    app.use(express.session({
      key: Ni.config('cookie_key'),
      secret: Ni.config('cookie_secret'),
      store: redisSessionStore}));
    
    app.use(function (req, res, next) {
      res.original_render = res.render;
      res.rlocals = {};
      res.render = function (file, options) {
        var rlocals = res.rlocals;
        rlocals.session = req.session;
        rlocals.breadcrumb = {
          controller: res.Ni.controller,
          action: res.Ni.action,
          params: Array.isArray(req.params) && req.params.slice(2)
        };
        if (typeof(options) === 'undefined') {
          options = {};
        }
        options.locals = helpers.merge(options.locals, rlocals);
        if (req.xhr) {
          options.layout = false;
        }
        res.original_render(file, options);
      };
      next();
    });
    
    app.use(Ni.router);
    
    app.use(Ni.renderView(function(req, res, next, filename) {
      res.render(filename, {layout: __dirname + '/views/layout.jade'});
    }));
    
    app.use(function (req, res, next) {
      res.render('404');
    });
    
    if (app.set('env') !== 'production') {
      app.use(express.errorHandler({showStack: true}));
    }
  
    app.listen(Ni.config('port'), Ni.config('host'));
    console.log('listening to '+Ni.config('host')+':'+Ni.config('port'));
    
  });