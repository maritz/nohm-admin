var Ni = require('ni');

exports.merge = function () {
  var result = {};
  for (var i = arguments.length - 1; i >= 0; i--) {
    if (typeof(arguments[i]) === 'object') {
      var obj = arguments[i];
      Object.keys(obj).forEach(function (i) {
        result[i] = obj[i];
      });
    }
  }
  return result;
};

/**
 * Redirect to login if not logged in
 */
exports.checkLoggedIn = function (req, res, cb) {
  var loginRequired = typeof(req.session.logged_in) === 'undefined' || !req.session.logged_in;
  if (loginRequired) {
    return res.redirect('/User/login');
  }
  cb();
};

/**
 * Redirect to database connection page when no db is selected or the selected db does not work.
 */
exports.checkRedisConnection = function (req, res, cb) {
  if (req.url !== '/Database/connect' && typeof(req.session.connection) === 'undefined') {
    var connection = Ni.config(req.session.connection),
        isValidConnection = connection !== null && typeof(connection.connected) !== 'undefined';
    if ( ! isValidConnection) {
      return res.redirect('/Database/connect');
    } else {
      req.redisConnection = connection;
    }
  }
  cb();
};

process.on('uncaughtException', function(excp) {
  if (excp.message || excp.name) {
    if (excp.name) process.stdout.write(excp.name);
    if (excp.message) process.stdout.write(excp.message);
    if (excp.backtrace) process.stdout.write(excp.backtrace);
    if (excp.stack) process.stdout.write(excp.stack);
  } else {
    sys = require('sys');
    process.stdout.write(sys.inspect(excp));    
  }
});