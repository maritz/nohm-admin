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