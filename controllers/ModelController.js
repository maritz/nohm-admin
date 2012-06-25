var Registry = require(__dirname+'/../registry.js');
var app = require('express').createServer();
var auth = require(__dirname+'/../helpers/auth');
var redis = Registry.redis;
var nohm = require('nohm').Nohm;

function ModelError(msg, code){
  this.name = 'UserError';
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


app.mounted(function (){
  console.log('mounted Model REST controller');
});

module.exports = app;