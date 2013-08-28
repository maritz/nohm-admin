var config = require(__dirname+'/config.js');
var express = require('express');
var registry = require(__dirname+'/registry.js');
var file_helper = require('./helpers/file.js');

var connector = require('./helpers/redisConnector');

console.log('WARNING: This application is not secure at all. Run this at your own risk and preferably on a machine that has good backups and no network access!');

if (process.env.NODE_ENV === 'production') {
  console.error('KILLING PROCESS. REASON: DO NOT RUN THIS ON PRODUCTION SERVERS!');
  process.exit();
}

console.log('INFO: For this application to work you need to setup an initial db connection in config.js. You can change the host/port/db/prefix in the running app though.');

connector.connect(function () {

    var model_files = file_helper.getFiles(__dirname, '/models/', ['validations.js']);

    model_files.forEach(function (val) {
      var name = val.match(/^\/models\/([\w]*)Model.js$/)[1];
      registry.Models[name] = require('.'+val);
    });

    var server = express.createServer();

    require('./static_file_server.js').init(server);


    server.use('/REST', require(__dirname+'/rest_server.js'));

    server.listen(config['static'].port || 3000);

    require('./socket_server.js').init(server);

    console.log('Server listening on port ' + (config['static'].port || 3000) + '.');
});