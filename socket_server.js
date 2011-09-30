var io = require('socket.io');
var file_helper = require('./helpers/file.js');
var fs = require('fs');
var config = require('./config.js');
var channels = {};

exports.init = function (app) {
  io = io.listen(app, config.socket.options);

  var controller_files = file_helper.getFiles(__dirname, '/socket_controllers/');
  
  controller_files.forEach(function (val) {
    var name = val.match(/^\/socket_controllers\/([\w]*)SocketChannel.js$/)[1];
    var connectionHandler = require('.'+val).connectionHandler;
    if ("function" === typeof (connectionHandler) ) {
      channels[name] = io
        .of('/'+name)
        .on('connection', connectionHandler);
    } else {
      console.log('Warning: Found socket controller without connection Handler export.');
    }
  });
  
  io.sockets.on('connection', function () {
    console.log('loololol');
  });
  
  return io;
};