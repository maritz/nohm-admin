var Ni = require('ni');
var helpers = require(__dirname+'/../helpers/general');

module.exports = {
  __init: function (cb, req, res, next) {
    helpers.checkLoggedIn(req, res, function() {
      res.Ni.controller = 'Database'; // since i've overwritten the controller for home to be News, this is neccessary for automatic views
      if (res.Ni.action !== 'connect') {
        helpers.checkRedisConnection(req, res, cb);
      } else {
        cb();
      }
    });
  },
  
  index: function (req, res, next) {
    next();
  },
  
  connect: function (req, res, next) {
    if ( ! req.xhr) {
      res.rlocals.form = {
        host: '127.0.0.1',
        port: '6379'
      };
    } else {
      var isValidRequest = req.xhr && req.body && req.body.host && req.body.port;
      var response = {
        type: 'formResult',
        errors: {}
      };
      if (isValidRequest) {
        var answerSent = false;
        var client = require('redis').createClient(req.body.port, req.body.host);
        var errorHandler = function (err) {
          response.errors.general = err.message;
          client.end();
          res.send(response);
        };
        client.on('error', errorHandler);
        client.on('connect', function () {
          if ( ! req.body.password) {
            res.send(response);
            var id = 'redisConn_'+(+new Date());
            Ni.config(id, client);
            req.session.connection = id;
            req.session.save();
          } else {
            console.log('OH MY GAWD! PASSWORD!');
          }
        });
        return true;
      }
      response.errors.general = 'Malformed request';
      return res.send(response);
    }
    next();
  }
};