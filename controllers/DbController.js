var Registry = require(__dirname+'/../registry.js');
var app = require('express').createServer();
var redis = Registry.redis;

var selected_dbs = Registry.selected_dbs = {};

if (redis) {
  selected_dbs[redis.host+':'+redis.port] = {
    client: redis,
    num_selected: 1000,
    pw: ''
  };
}

function DbError(msg, code){
  this.name = 'DbError';
  if (typeof(msg) === 'string') {
    this.message = msg;
  } else {
    this.data = msg;
    this.message = 'custom';
  }
  this.code = code || 504;
  Error.call(this, msg);
}

DbError.prototype.__proto__ = Error.prototype;

app.get('/', function (req, res, next) {
  var selected = req.getDb();
  if (!selected) {
    next(new DbError('Invalid database selected and default fallback does not exist.'));
  }
  res.ok({
    host: selected.host,
    port: selected.port,
    selected: selected.selected_db || 0,
    prefix: req.getPrefix()
  });
});

app.post('/connection', function (req, res, next) {
  var host = req.param('host');
  var port = req.param('port');
  var pw = req.param('pw');
  var selection = host+':'+port;

  var setConnection = function (selection) {
    if (selected_dbs[req.session.selected_db] && selection !== req.session.selected_db && --selected_dbs[req.session.selected_db].num_selected < 1) {
      selected_dbs[req.session.selected_db].client.quit();
      delete selected_dbs[req.session.selected_db];
    }
    req.session.selected_db = selection;

    selected_dbs[selection].num_selected++;
    res.ok('Connection to '+selection+' successful.');
  }

  if (selection === req.session.selected_db && selected_dbs[selection]) {

    res.ok('You already have this redis connection selected.');

  } else if (selected_dbs[selection]) {

    if (selected_dbs[selection].pw && pw !== selected_dbs[selection].pw) {
      next(new DbError('Authentication failed.'));
    } else {
      setConnection(selection);
    }

  } else {

    var connection = require('redis').createClient(port, host, {
      max_attempts: 1
    });

    if (pw) {
      connection.auth(pw, function (err) {
        if (err) {
          next(new DbError('Authentication failed.'));
        }
      });
    }

    connection.on('ready', function () {
      selected_dbs[selection] = {
        client: connection,
        num_selected: 0
      };
      connection.removeAllListeners('error')
      setConnection(selection);
    });

    connection.on('error', function (err) {
      console.log('Connection error.', err);
      next(new DbError('Connection failed.'));
    });

  }
});

app.post('/select', function (req, res, next) {
  var client = req.getDb();
  var selected = client.selected_db || 0;
  var new_select = parseInt(req.param('db'), 10);
  if (selected === new_select) {
    res.ok('You already have this database selected.');
  } else if (new_select >= 0 && new_select <= 15) {
    client.select(new_select, function (err) {
      if (err) {
        next(new DbError('Selecting the database failed: '+err));
      } else {
        res.ok({
          selected: new_select
        });
      }
    });
  } else {
    next(new DbError('Selected database must be from 0 to 15 (inclusive).'));
  }
});

app.post('/prefix', function (req, res, next) {
  req.session.nohm_prefix = req.param('prefix');
  require('nohm').Nohm.setPrefix(req.param('prefix'));
  res.ok({
    prefix: req.session.nohm_prefix
  });
});

app.mounted(function (){
  console.log('mounted Db REST controller');
});

module.exports = app;